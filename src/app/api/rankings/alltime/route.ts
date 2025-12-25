import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, MIN_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

// Get eligible user IDs (same logic as community route)
async function getEligibleUserIds(): Promise<string[]> {
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
      ratings: {
        select: {
          player: {
            select: { category: true }
          }
        }
      }
    }
  })
  
  const eligibleIds: string[] = []
  
  for (const user of users) {
    // System users are always eligible
    if (user.discordId && user.discordId.startsWith("system_")) {
      eligibleIds.push(user.id)
      continue
    }

    const infantryCount = user.ratings.filter(r => r.player.category === "INFANTRY").length
    const cavalryCount = user.ratings.filter(r => r.player.category === "CAVALRY").length
    const archerCount = user.ratings.filter(r => r.player.category === "ARCHER").length
    
    if (
      infantryCount >= MIN_RATINGS.INFANTRY &&
      cavalryCount >= MIN_RATINGS.CAVALRY &&
      archerCount >= MIN_RATINGS.ARCHER
    ) {
      eligibleIds.push(user.id)
    }
  }
  
  return eligibleIds
}

// Get all-time rankings (average of all monthly rankings + legends)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    
    // Get eligible users first
    const eligibleUserIds = await getEligibleUserIds()
    
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
      isLegend: boolean
      avatar: string | null
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
          }],
          isLegend: false,
          avatar: null,
        })
      }
    }
    
    // Also fetch legends and add them to all-time rankings
    // Only include ratings from eligible users
    const legends = await prisma.player.findMany({
      where: {
        isLegend: true,
        ...(category ? { category: category as any } : {}),
      },
      include: {
        ratings: {
          where: {
            raterId: { in: eligibleUserIds }  // Only eligible users
          },
          include: {
            rater: {
              select: { division: true, discordId: true }
            }
          }
        }
      }
    })
    
    for (const legend of legends) {
      // Calculate legend's rating from actual votes (already filtered to eligible users)
      const realRatings = legend.ratings.filter(r => !isSystemRater(r.rater.discordId))
      let avgRating = 70 // Default if no eligible ratings
      
      if (realRatings.length > 0) {
        let weightedSum = 0
        let totalWeight = 0
        for (const rating of realRatings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.075  // No division = lowest weight
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        avgRating = totalWeight > 0 ? weightedSum / totalWeight : 70
      }
      
      // Add or update legend in the map
      // For legends, we ALWAYS use the fresh calculated rating, not historical
      if (!playerMap.has(legend.id)) {
        playerMap.set(legend.id, {
          playerId: legend.id,
          playerName: legend.name,
          category: legend.category,
          clan: legend.clan,
          nationality: legend.nationality,
          ratings: [avgRating],
          periodNames: ["Legend"],
          history: [{ period: "Legend", rating: avgRating }],
          isLegend: true,
          avatar: legend.avatar,
        })
      } else {
        // Update existing entry to mark as legend and REPLACE ratings with fresh calculation
        const existing = playerMap.get(legend.id)!
        existing.isLegend = true
        existing.avatar = legend.avatar
        // Replace all historical ratings with the fresh calculated legend rating
        existing.ratings = [avgRating]
        existing.periodNames = ["Legend"]
        existing.history = [{ period: "Legend", rating: avgRating }]
        // Update player info from legend data
        existing.playerName = legend.name
        existing.clan = legend.clan
        existing.nationality = legend.nationality
      }
    }
    
    // Calculate averages and create final list
    const allTimeRankings = Array.from(playerMap.values()).map(player => ({
      playerId: player.playerId,
      playerName: player.playerName,
      category: player.category,
      clan: player.clan,
      nationality: player.nationality,
      avatar: player.avatar,
      averageRating: Math.round((player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length) * 10) / 10,
      periodCount: player.ratings.length,
      periods: player.periodNames,
      history: player.history,
      isLegend: player.isLegend,
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

