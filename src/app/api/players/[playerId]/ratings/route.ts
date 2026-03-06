import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, MIN_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    // Get eligible user IDs first (same as rankings)
    const eligibleUserIds = await getEligibleUserIds()

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        category: true,
        clan: true,
        nationality: true,
        ratings: {
          where: {
            raterId: { in: eligibleUserIds }  // Only eligible users
          },
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                discordName: true,
                discordId: true,
                division: true,
              }
            }
          },
          orderBy: { score: "desc" }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Filter out system ratings and format the response
    const realRatings = player.ratings
      .filter(r => !r.rater.discordId?.startsWith("system_"))
      .map(r => ({
        id: r.id,
        score: r.score,
        raterName: r.rater.name,
        raterDiscordName: r.rater.discordName,
        raterDivision: r.rater.division,
      }))

    // Calculate WEIGHTED average from real ratings (same as rankings)
    let averageRating: number | null = null
    if (realRatings.length > 0) {
      let weightedSum = 0
      let totalWeight = 0
      for (const rating of realRatings) {
        const weight = rating.raterDivision 
          ? DIVISION_WEIGHTS[rating.raterDivision] 
          : 0.075  // No division = lowest weight
        weightedSum += rating.score * weight
        totalWeight += weight
      }
      averageRating = totalWeight > 0 ? weightedSum / totalWeight : null
    }

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
      },
      ratings: realRatings,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      totalRatings: realRatings.length,
    })
  } catch (error) {
    console.error("Player ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


