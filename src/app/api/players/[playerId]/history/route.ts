import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        category: true,
        clan: true,
        nationality: true,
        avatar: true,
        isLegend: true,
        ratings: {
          include: {
            rater: { select: { division: true, discordId: true } }
          }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Get historical rankings for this player across all periods
    const historicalRankings = await prisma.historicalRanking.findMany({
      where: { playerId },
      include: {
        period: { select: { name: true, endDate: true } }
      },
      orderBy: { period: { endDate: "asc" } }
    })

    const history: { period: string; rating: number; rank: number; date: string }[] = []

    for (const hr of historicalRankings) {
      history.push({
        period: hr.period.name,
        rating: Math.round(hr.averageRating * 10) / 10,
        rank: hr.rank,
        date: hr.period.endDate.toISOString(),
      })
    }

    // Calculate current rating
    const realRatings = player.ratings.filter(r => !isSystemRater(r.rater.discordId))
    let currentRating: number | null = null
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
      currentRating = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null
    }

    if (currentRating !== null) {
      history.push({
        period: "Current",
        rating: currentRating,
        rank: 0,
        date: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
        avatar: player.avatar,
        isLegend: player.isLegend,
      },
      history,
      currentRating,
      totalCurrentRatings: realRatings.length,
    })
  } catch (error) {
    console.error("Player history GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
