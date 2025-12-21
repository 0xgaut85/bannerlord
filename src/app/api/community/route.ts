import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PlayerCategory } from "@prisma/client"
import { DIVISION_WEIGHTS, MIN_RATINGS, MIN_PLAYER_RATINGS } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as PlayerCategory | null
    
    if (!category || !Object.values(PlayerCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    
    // Get all eligible users (those who have rated minimum required)
    // AND system raters who are always eligible
    const eligibleUserIds = await getEligibleUserIds()
    
    // Get players with their ratings from eligible users only
    const players = await prisma.player.findMany({
      where: { category },
      include: {
        ratings: {
          where: {
            raterId: { in: eligibleUserIds }
          },
          include: {
            rater: {
              select: { division: true }
            }
          }
        }
      }
    })
    
    // Calculate weighted average for each player
    const rankedPlayers = players
      // Filter: only include players with at least MIN_PLAYER_RATINGS ratings
      .filter(player => player.ratings.length >= MIN_PLAYER_RATINGS)
      .map(player => {
        let weightedSum = 0
        let totalWeight = 0
        
        for (const rating of player.ratings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.5
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        
        const averageRating = totalWeight > 0 ? weightedSum / totalWeight : 0
        
        return {
          id: player.id,
          name: player.name,
          category: player.category,
          nationality: player.nationality,
          clan: player.clan,
          bio: player.bio,
          avatar: player.avatar,
          division: player.division,
          averageRating: Math.round(averageRating * 100) / 100,
          totalRatings: player.ratings.length,
        }
      })
    
    // Sort by average rating descending
    rankedPlayers.sort((a, b) => b.averageRating - a.averageRating)
    
    // Add rank
    const result = rankedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Community GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getEligibleUserIds(): Promise<string[]> {
  // Get users with their rating counts per category
  const users = await prisma.user.findMany({
    // Include system users (profile might not be "complete" in same way, or explicit system flag)
    // We check discordId starting with "system_" or normal eligibility
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
