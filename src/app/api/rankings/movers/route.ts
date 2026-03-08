import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS } from "@/lib/utils"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getEligibleUserIds(): Promise<string[]> {
  const MIN_RATINGS = { INFANTRY: 15, CAVALRY: 10, ARCHER: 10 }
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { isProfileComplete: true },
        { discordId: { startsWith: "system_" } }
      ]
    },
    select: {
      id: true,
      discordId: true,
      ratings: { select: { player: { select: { category: true } } } }
    }
  })

  const ids: string[] = []
  for (const user of users) {
    if (user.discordId?.startsWith("system_")) { ids.push(user.id); continue }
    const inf = user.ratings.filter(r => r.player.category === "INFANTRY").length
    const cav = user.ratings.filter(r => r.player.category === "CAVALRY").length
    const arc = user.ratings.filter(r => r.player.category === "ARCHER").length
    if (inf >= MIN_RATINGS.INFANTRY && cav >= MIN_RATINGS.CAVALRY && arc >= MIN_RATINGS.ARCHER) {
      ids.push(user.id)
    }
  }
  return ids
}

export async function GET() {
  try {
    const lastPeriod = await prisma.rankingPeriod.findFirst({
      orderBy: { endDate: "desc" },
      select: { id: true, name: true },
    })

    if (!lastPeriod) {
      return NextResponse.json({ winners: [], losers: [], previousPeriod: null })
    }

    const historicalRankings = await prisma.historicalRanking.findMany({
      where: { periodId: lastPeriod.id },
      select: { playerId: true, averageRating: true, playerName: true },
    })

    if (historicalRankings.length === 0) {
      return NextResponse.json({ winners: [], losers: [], previousPeriod: lastPeriod.name })
    }

    const prevMap = new Map(historicalRankings.map(h => [h.playerId, h.averageRating]))

    const eligibleUserIds = await getEligibleUserIds()

    const players = await prisma.player.findMany({
      where: {
        isLegend: false,
        id: { in: Array.from(prevMap.keys()) },
      },
      include: {
        ratings: {
          where: { raterId: { in: eligibleUserIds } },
          include: { rater: { select: { division: true, discordId: true } } }
        }
      }
    })

    const clanNames = [...new Set(players.map(p => p.clan).filter(Boolean))] as string[]
    const clans = await prisma.clan.findMany({
      where: { OR: [{ shortName: { in: clanNames } }, { name: { in: clanNames } }] },
      select: { name: true, shortName: true, logo: true }
    })
    const clanLogos: Record<string, string | null> = {}
    clans.forEach(c => { clanLogos[c.shortName] = c.logo; if (c.name) clanLogos[c.name] = c.logo })

    const deltas = players.map(player => {
      const realRatings = player.ratings.filter(r => !r.rater.discordId?.startsWith("system_"))
      if (realRatings.length < 5) return null

      let weightedSum = 0
      let totalWeight = 0
      for (const rating of realRatings) {
        const weight = rating.rater.division
          ? DIVISION_WEIGHTS[rating.rater.division]
          : 0.075
        weightedSum += rating.score * weight
        totalWeight += weight
      }
      const currentRating = totalWeight > 0 ? weightedSum / totalWeight : 0
      const previousRating = prevMap.get(player.id)
      if (previousRating === undefined) return null

      const current = Math.round(currentRating * 10) / 10
      const previous = Math.round(previousRating * 10) / 10
      const delta = Math.round((current - previous) * 10) / 10

      // Only include Div A and B players (rating >= 80 in either current or previous)
      if (current < 80 && previous < 80) return null
      if (delta === 0) return null

      return {
        id: player.id,
        name: player.name,
        category: player.category,
        nationality: player.nationality,
        clan: player.clan,
        clanLogo: player.clan ? clanLogos[player.clan] || null : null,
        avatar: player.avatar,
        currentRating: current,
        previousRating: previous,
        delta,
      }
    }).filter(Boolean) as {
      id: string; name: string; category: string; nationality: string | null;
      clan: string | null; clanLogo: string | null; avatar: string | null;
      currentRating: number; previousRating: number; delta: number;
    }[]

    deltas.sort((a, b) => b.delta - a.delta)

    const winners = deltas.filter(d => d.delta > 0).slice(0, 5)
    const losers = deltas.filter(d => d.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5)

    return NextResponse.json({
      winners,
      losers,
      previousPeriod: lastPeriod.name,
    })
  } catch (error) {
    console.error("Movers GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
