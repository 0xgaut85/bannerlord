import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PlayerCategory, Division } from "@prisma/client"
import { DIVISION_WEIGHTS, MIN_RATINGS, MIN_PLAYER_RATINGS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

// Calculate division from rating
function getDivisionFromRating(rating: number): string {
  if (rating >= 85) return "A"
  if (rating >= 80) return "B"
  if (rating >= 75) return "C"
  if (rating >= 70) return "D"
  if (rating >= 65) return "E"
  if (rating >= 60) return "F"
  if (rating >= 55) return "G"
  return "H+" // 50 and below
}

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
    
    // Get all players with their ratings from eligible users
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
    
    // Get all unique clan names and fetch their logos
    const clanNames = [...new Set(players.map(p => p.clan).filter(Boolean))] as string[]
    
    // Fetch clan logos from Clan table
    const clans = await prisma.clan.findMany({
      where: {
        shortName: { in: clanNames }
      },
      select: {
        shortName: true,
        logo: true,
      }
    })
    
    // Create a map of clan shortName to logo
    const clanLogos: Record<string, string | null> = {}
    clans.forEach(c => {
      clanLogos[c.shortName] = c.logo
    })
    
    // Calculate weighted average for each player
    const rankedPlayers = players.map(player => {
      const hasRatings = player.ratings.length > 0
      
      let averageRating: number
      
      if (hasRatings) {
        // Calculate weighted average from actual ratings (even if just 1 rating)
        let weightedSum = 0
        let totalWeight = 0
        
        for (const rating of player.ratings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.5
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        
        averageRating = totalWeight > 0 ? weightedSum / totalWeight : 0
      } else if (player.division) {
        // No ratings yet - use default rating based on division
        averageRating = DIVISION_DEFAULT_RATINGS[player.division as Division]
      } else {
        // No division set and no ratings - use 70 as default
        averageRating = 70
      }
      
      // Calculate display division from rating if not set in database
      const displayDivision = player.division || getDivisionFromRating(averageRating)
      
      return {
        id: player.id,
        name: player.name,
        category: player.category,
        nationality: player.nationality,
        clan: player.clan,
        clanLogo: player.clan ? clanLogos[player.clan] || null : null,
        bio: player.bio,
        avatar: player.avatar,
        division: displayDivision,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: player.ratings.length,
        hasRatings,
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
