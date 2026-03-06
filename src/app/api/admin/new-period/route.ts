import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { periodName, newPeriodName, newPeriodEnd, adminUsername, adminPassword } = body

    const envUser = process.env.ADMIN_USERNAME
    const envPass = process.env.ADMIN_PASSWORD
    if (!envUser || !envPass || adminUsername !== envUser || adminPassword !== envPass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!periodName) {
      return NextResponse.json({ error: "Current period name required for snapshot" }, { status: 400 })
    }
    if (!newPeriodName) {
      return NextResponse.json({ error: "New period name required" }, { status: 400 })
    }

    const existingPeriod = await prisma.rankingPeriod.findUnique({
      where: { name: periodName }
    })
    if (existingPeriod) {
      return NextResponse.json({ error: `Period "${periodName}" already exists in history` }, { status: 400 })
    }

    // Fetch all non-legend players with their ratings for the snapshot
    const players = await prisma.player.findMany({
      where: { isLegend: false },
      include: {
        ratings: {
          include: {
            rater: { select: { division: true, discordId: true } }
          }
        }
      }
    })

    const rankings: {
      playerId: string
      playerName: string
      category: any
      clan: string | null
      nationality: string | null
      averageRating: number
      totalRatings: number
    }[] = []

    for (const player of players) {
      const realRatings = player.ratings.filter(r => !r.rater.discordId?.startsWith("system_"))

      let averageRating: number
      if (realRatings.length > 0) {
        let weightedSum = 0
        let totalWeight = 0
        for (const rating of realRatings) {
          const weight = rating.rater.division
            ? DIVISION_WEIGHTS[rating.rater.division]
            : 0.075
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        averageRating = totalWeight > 0 ? weightedSum / totalWeight : 70
      } else {
        averageRating = player.division
          ? DIVISION_DEFAULT_RATINGS[player.division]
          : 70
      }

      rankings.push({
        playerId: player.id,
        playerName: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: realRatings.length,
      })
    }

    rankings.sort((a, b) => b.averageRating - a.averageRating)

    const now = new Date()

    // 1. Save snapshot (legends excluded)
    await prisma.rankingPeriod.create({
      data: {
        name: periodName,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
        rankings: {
          create: rankings.map((r, idx) => ({
            playerId: r.playerId,
            playerName: r.playerName,
            category: r.category,
            clan: r.clan,
            nationality: r.nationality,
            averageRating: r.averageRating,
            totalRatings: r.totalRatings,
            rank: idx + 1,
          }))
        }
      }
    })

    // 2. Delete ratings for non-legend players only (legends keep theirs forever)
    const legendPlayers = await prisma.player.findMany({
      where: { isLegend: true },
      select: { id: true }
    })
    const legendIds = legendPlayers.map(p => p.id)

    const deleted = await prisma.rating.deleteMany({
      where: { playerId: { notIn: legendIds } }
    })

    // 3. Update site settings for new period
    const newEnd = newPeriodEnd ? new Date(newPeriodEnd) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    await prisma.siteSettings.upsert({
      where: { id: "settings" },
      create: {
        id: "settings",
        currentPeriodName: newPeriodName,
        currentPeriodEnd: newEnd,
        skippedAnomalies: [],
      },
      update: {
        currentPeriodName: newPeriodName,
        currentPeriodEnd: newEnd,
        skippedAnomalies: [],
      }
    })

    return NextResponse.json({
      success: true,
      snapshot: periodName,
      ratingsDeleted: deleted.count,
      legendsPreserved: legendIds.length,
      newPeriod: newPeriodName,
      newPeriodEnd: newEnd.toISOString(),
    })
  } catch (error) {
    console.error("New period error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
