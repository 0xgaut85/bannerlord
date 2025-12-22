import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Get all-time rankings (average of all monthly rankings)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    
    // Get all periods ordered by date
    const periods = await prisma.rankingPeriod.findMany({
      orderBy: { endDate: 'asc' },
      select: { id: true, name: true }
    })
    
    // Get all historical rankings grouped by player
    const allRankings = await prisma.historicalRanking.findMany({
      where: category ? { category: category as any } : undefined,
      select: {
        playerId: true,
        playerName: true,
        category: true,
        clan: true,
        nationality: true,
        averageRating: true,
        periodId: true,
        period: {
          select: { name: true, endDate: true }
        }
      },
      orderBy: {
        period: { endDate: 'asc' }
      }
    })
    
    // Group by player and calculate all-time average
    const playerMap = new Map<string, {
      playerId: string
      playerName: string
      category: string
      clan: string | null
      nationality: string | null
      ratings: number[]
      periodNames: string[]
      history: { period: string; rating: number }[]
    }>()
    
    for (const ranking of allRankings) {
      const existing = playerMap.get(ranking.playerId)
      if (existing) {
        existing.ratings.push(ranking.averageRating)
        existing.periodNames.push(ranking.period.name)
        existing.history.push({
          period: ranking.period.name,
          rating: ranking.averageRating
        })
        // Update to latest info
        existing.playerName = ranking.playerName
        existing.clan = ranking.clan
        existing.nationality = ranking.nationality
      } else {
        playerMap.set(ranking.playerId, {
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          category: ranking.category,
          clan: ranking.clan,
          nationality: ranking.nationality,
          ratings: [ranking.averageRating],
          periodNames: [ranking.period.name],
          history: [{
            period: ranking.period.name,
            rating: ranking.averageRating
          }]
        })
      }
    }
    
    // Calculate averages and create final list
    const allTimeRankings = Array.from(playerMap.values()).map(player => ({
      playerId: player.playerId,
      playerName: player.playerName,
      category: player.category,
      clan: player.clan,
      nationality: player.nationality,
      averageRating: Math.round((player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length) * 10) / 10,
      periodCount: player.ratings.length,
      periods: player.periodNames,
      history: player.history,
    }))
    
    // Sort by average rating
    allTimeRankings.sort((a, b) => b.averageRating - a.averageRating)
    
    // Add ranks
    const rankedRankings = allTimeRankings.map((r, idx) => ({
      ...r,
      rank: idx + 1,
    }))
    
    return NextResponse.json({
      rankings: rankedRankings,
      periods: periods.map(p => p.name)
    })
  } catch (error) {
    console.error("All-time GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

