import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

export async function GET() {
  try {
    // Get all players with their ratings
    const players = await prisma.player.findMany({
      include: {
        ratings: {
          include: {
            rater: {
              select: { division: true, discordId: true }
            }
          }
        }
      }
    })

    // Get unique voters
    const voters = await prisma.user.findMany({
      where: {
        ratings: { some: {} },
        NOT: { discordId: { startsWith: "system_" } }
      }
    })

    // Calculate stats
    const totalPlayers = players.length
    const totalRatings = players.reduce((sum, p) => 
      sum + p.ratings.filter(r => !isSystemRater(r.rater.discordId)).length, 0
    )
    const totalVoters = voters.length

    // By category
    const byCategory = {
      INFANTRY: { count: 0, totalRating: 0 },
      CAVALRY: { count: 0, totalRating: 0 },
      ARCHER: { count: 0, totalRating: 0 },
    }

    // By division
    const byDivision: Record<string, { count: number; totalRating: number }> = {}

    // By clan
    const clanStats: Record<string, { count: number; totalRating: number }> = {}

    // By nationality
    const nationalityStats: Record<string, { count: number; totalRating: number }> = {}

    // Rating distribution buckets
    const ratingBuckets: Record<string, number> = {
      "50-59": 0,
      "60-69": 0,
      "70-79": 0,
      "80-84": 0,
      "85-89": 0,
      "90-94": 0,
      "95-99": 0,
    }

    for (const player of players) {
      // Calculate player's weighted average rating
      const realRatings = player.ratings.filter(r => !isSystemRater(r.rater.discordId))
      
      let avgRating: number
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
      } else {
        avgRating = player.division 
          ? DIVISION_DEFAULT_RATINGS[player.division] 
          : 70
      }

      // Category stats
      const cat = player.category as keyof typeof byCategory
      if (byCategory[cat]) {
        byCategory[cat].count++
        byCategory[cat].totalRating += avgRating
      }

      // Division stats
      if (player.division) {
        if (!byDivision[player.division]) {
          byDivision[player.division] = { count: 0, totalRating: 0 }
        }
        byDivision[player.division].count++
        byDivision[player.division].totalRating += avgRating
      }

      // Clan stats
      const clan = player.clan || "Free Agent"
      if (!clanStats[clan]) {
        clanStats[clan] = { count: 0, totalRating: 0 }
      }
      clanStats[clan].count++
      clanStats[clan].totalRating += avgRating

      // Nationality stats
      const nation = player.nationality || "Unknown"
      if (!nationalityStats[nation]) {
        nationalityStats[nation] = { count: 0, totalRating: 0 }
      }
      nationalityStats[nation].count++
      nationalityStats[nation].totalRating += avgRating

      // Rating distribution
      if (avgRating >= 95) ratingBuckets["95-99"]++
      else if (avgRating >= 90) ratingBuckets["90-94"]++
      else if (avgRating >= 85) ratingBuckets["85-89"]++
      else if (avgRating >= 80) ratingBuckets["80-84"]++
      else if (avgRating >= 70) ratingBuckets["70-79"]++
      else if (avgRating >= 60) ratingBuckets["60-69"]++
      else ratingBuckets["50-59"]++
    }

    // Format response
    const response = {
      totalPlayers,
      totalRatings,
      totalVoters,
      byCategory: {
        INFANTRY: {
          count: byCategory.INFANTRY.count,
          avgRating: byCategory.INFANTRY.count > 0 
            ? byCategory.INFANTRY.totalRating / byCategory.INFANTRY.count 
            : 0
        },
        CAVALRY: {
          count: byCategory.CAVALRY.count,
          avgRating: byCategory.CAVALRY.count > 0 
            ? byCategory.CAVALRY.totalRating / byCategory.CAVALRY.count 
            : 0
        },
        ARCHER: {
          count: byCategory.ARCHER.count,
          avgRating: byCategory.ARCHER.count > 0 
            ? byCategory.ARCHER.totalRating / byCategory.ARCHER.count 
            : 0
        },
      },
      byDivision: Object.fromEntries(
        Object.entries(byDivision).map(([div, data]) => [
          div,
          {
            count: data.count,
            avgRating: data.count > 0 ? data.totalRating / data.count : 0
          }
        ])
      ),
      topClans: await Promise.all(
        Object.entries(clanStats)
          .filter(([name]) => name !== "Free Agent")
          .map(async ([name, data]) => {
            // Get clan info including logo
            const clanInfo = await prisma.clan.findFirst({
              where: { shortName: name },
              select: { name: true, shortName: true, logo: true }
            })
            return {
              name: clanInfo?.name || name,
              shortName: name,
              logo: clanInfo?.logo || null,
              count: data.count,
              avgRating: data.count > 0 ? data.totalRating / data.count : 0
            }
          })
      ).then(clans => 
        clans
          .filter(c => c.count >= 3)
          .sort((a, b) => b.avgRating - a.avgRating)
      ),
      topNationalities: Object.entries(nationalityStats)
        .map(([code, data]) => ({
          code,
          count: data.count,
          avgRating: data.count > 0 ? data.totalRating / data.count : 0
        }))
        .filter(n => n.count >= 3) // At least 3 players
        .sort((a, b) => b.avgRating - a.avgRating),
      ratingDistribution: Object.entries(ratingBuckets).map(([range, count]) => ({
        range,
        count
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Stats GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

