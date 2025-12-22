import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PlayerCategory, Division } from "@prisma/client"
import { DIVISION_WEIGHTS, MIN_RATINGS, MIN_PLAYER_RATINGS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    
    // Get all players with their ratings from eligible users (exclude legends)
    const players = await prisma.player.findMany({
      where: { 
        category,
        isLegend: false  // Exclude legends from current rankings
      },
      include: {
        ratings: {
          where: {
            raterId: { in: eligibleUserIds }
          },
          include: {
            rater: {
              select: { division: true, discordId: true }
            }
          }
        }
      }
    })
    
    // Get all unique clan names and fetch their logos
    const clanNames = [...new Set(players.map(p => p.clan).filter(Boolean))] as string[]
    
    // Fetch clan logos from Clan table (match by shortName OR name)
    const clans = await prisma.clan.findMany({
      where: {
        OR: [
          { shortName: { in: clanNames } },
          { name: { in: clanNames } }
        ]
      },
      select: {
        name: true,
        shortName: true,
        logo: true,
      }
    })
    
    // Create a map of clan name/shortName to logo
    const clanLogos: Record<string, string | null> = {}
    clans.forEach(c => {
      // Map both name and shortName to the logo
      clanLogos[c.shortName] = c.logo
      if (c.name) clanLogos[c.name] = c.logo
    })
    
    // Calculate weighted average for each player
    const rankedPlayers = players.map(player => {
      // CRITICAL: Separate real user ratings from system ratings
      // System ratings are ONLY used as defaults when NO real ratings exist
      // Once a player has at least 1 real rating, system ratings are completely ignored
      const realRatings = player.ratings.filter(r => 
        !r.rater.discordId?.startsWith("system_")
      )
      const systemRatings = player.ratings.filter(r => 
        r.rater.discordId?.startsWith("system_")
      )
      const hasRealRatings = realRatings.length > 0
      
      let averageRating: number
      
      if (hasRealRatings) {
        // Player has real user ratings - ONLY use real ratings, completely ignore system ratings
        let weightedSum = 0
        let totalWeight = 0
        
        for (const rating of realRatings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.5
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        
        averageRating = totalWeight > 0 ? weightedSum / totalWeight : 0
      } else if (systemRatings.length > 0 && player.division) {
        // No real ratings yet - use default rating based on division (system ratings are just placeholders)
        averageRating = DIVISION_DEFAULT_RATINGS[player.division as Division]
      } else if (systemRatings.length > 0) {
        // Has system ratings but no division - calculate from system ratings as fallback
        let weightedSum = 0
        let totalWeight = 0
        for (const rating of systemRatings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.5
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        averageRating = totalWeight > 0 ? weightedSum / totalWeight : 70
      } else {
        // No ratings at all - use 70 as default
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
        totalRatings: realRatings.length, // Only count real user ratings
        hasRatings: hasRealRatings,
      }
    })
    
    // Sort by average rating descending
    rankedPlayers.sort((a, b) => b.averageRating - a.averageRating)
    
    // Add rank
    const result = rankedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }))
    
    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
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
