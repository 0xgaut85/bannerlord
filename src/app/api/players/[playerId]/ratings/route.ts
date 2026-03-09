import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, MIN_RATINGS, filterRatingsForPlayer } from "@/lib/utils"

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

    // All real ratings for display (includes muted — nobody should notice)
    const allRealRatings = player.ratings
      .filter(r => !r.rater.discordId?.startsWith("system_"))
      .map(r => ({
        id: r.id,
        score: r.score,
        isMuted: r.isMuted,
        raterName: r.rater.name,
        raterDiscordName: r.rater.discordName,
        raterDivision: r.rater.division,
      }))

    // For average: exclude muted + apply hidden bounds
    const ratingsForAvg = filterRatingsForPlayer(
      player.name,
      allRealRatings.filter(r => !r.isMuted)
    )

    let averageRating: number | null = null
    if (ratingsForAvg.length > 0) {
      let weightedSum = 0
      let totalWeight = 0
      for (const rating of ratingsForAvg) {
        const weight = rating.raterDivision 
          ? DIVISION_WEIGHTS[rating.raterDivision] 
          : 0.075
        weightedSum += rating.score * weight
        totalWeight += weight
      }
      averageRating = totalWeight > 0 ? weightedSum / totalWeight : null
    }

    // Display list: all ratings without exposing muted status
    const displayRatings = allRealRatings.map(({ isMuted, ...rest }) => rest)

    // Fetch most recent historical rating for this player to compute delta
    const lastHistorical = await prisma.historicalRanking.findFirst({
      where: { playerId },
      orderBy: { period: { endDate: "desc" } },
      select: { averageRating: true, period: { select: { name: true } } },
    })

    const currentRounded = averageRating ? Math.round(averageRating * 10) / 10 : null
    let previousRating: number | null = null
    let previousPeriod: string | null = null
    let ratingDelta: number | null = null

    if (lastHistorical && currentRounded !== null) {
      previousRating = Math.round(lastHistorical.averageRating * 10) / 10
      previousPeriod = lastHistorical.period.name
      ratingDelta = Math.round((currentRounded - previousRating) * 10) / 10
    }

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
      },
      ratings: displayRatings,
      averageRating: currentRounded,
      totalRatings: displayRatings.length,
      previousRating,
      previousPeriod,
      ratingDelta,
    })
  } catch (error) {
    console.error("Player ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


