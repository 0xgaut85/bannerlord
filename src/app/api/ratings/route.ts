import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canUserEdit, MIN_PLAYER_RATINGS, MAX_RATING_DEVIATION, DIVISION_WEIGHTS } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const ratings = await prisma.rating.findMany({
      where: { raterId: session.user.id },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            category: true,
            nationality: true,
          }
        }
      },
      orderBy: { player: { name: "asc" } }
    })
    
    return NextResponse.json(ratings)
  } catch (error) {
    console.error("Ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper to calculate current average rating for a player
async function getPlayerAverageRating(playerId: string, excludeRaterId?: string): Promise<{ average: number; count: number }> {
  const ratings = await prisma.rating.findMany({
    where: { 
      playerId,
      ...(excludeRaterId ? { raterId: { not: excludeRaterId } } : {})
    },
    include: {
      rater: {
        select: { division: true }
      }
    }
  })
  
  if (ratings.length === 0) {
    return { average: 0, count: 0 }
  }
  
  let weightedSum = 0
  let totalWeight = 0
  
  for (const rating of ratings) {
    const weight = rating.rater.division 
      ? DIVISION_WEIGHTS[rating.rater.division] 
      : 0.25
    weightedSum += rating.score * weight
    totalWeight += weight
  }
  
  return { 
    average: totalWeight > 0 ? weightedSum / totalWeight : 0,
    count: ratings.length
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if profile is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProfileComplete: true, lastEditAt: true, division: true }
    })
    
    if (!user?.isProfileComplete) {
      return NextResponse.json({ 
        error: "Please complete your profile (set team and division) before rating" 
      }, { status: 403 })
    }
    
    // Check 24h cooldown
    if (!canUserEdit(user.lastEditAt)) {
      return NextResponse.json({ 
        error: "You can only edit your ratings once every 24 hours" 
      }, { status: 429 })
    }
    
    const body = await request.json()
    const { ratings } = body as { ratings: { playerId: string; score: number }[] }
    
    if (!Array.isArray(ratings)) {
      return NextResponse.json({ error: "Invalid ratings format" }, { status: 400 })
    }
    
    // Validate scores (50-99) and check anti-troll rule for established players
    const validationErrors: string[] = []
    
    for (const rating of ratings) {
      if (rating.score < 50 || rating.score > 99) {
        return NextResponse.json({ 
          error: "Scores must be between 50 and 99" 
        }, { status: 400 })
      }
      
      // Check if player has enough ratings (anti-troll protection)
      const { average, count } = await getPlayerAverageRating(rating.playerId, session.user.id)
      
      if (count >= MIN_PLAYER_RATINGS) {
        // Player is established - enforce ±7.5 rule
        const minAllowed = Math.max(50, Math.floor(average - MAX_RATING_DEVIATION))
        const maxAllowed = Math.min(99, Math.ceil(average + MAX_RATING_DEVIATION))
        
        if (rating.score < minAllowed || rating.score > maxAllowed) {
          const player = await prisma.player.findUnique({
            where: { id: rating.playerId },
            select: { name: true }
          })
          validationErrors.push(
            `${player?.name || 'Player'}: rating must be between ${minAllowed} and ${maxAllowed} (current avg: ${average.toFixed(1)})`
          )
        }
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: "Rating out of allowed range",
        details: validationErrors
      }, { status: 400 })
    }
    
    // Upsert all ratings in a transaction
    await prisma.$transaction(async (tx) => {
      for (const rating of ratings) {
        await tx.rating.upsert({
          where: {
            raterId_playerId: {
              raterId: session.user.id,
              playerId: rating.playerId,
            }
          },
          create: {
            raterId: session.user.id,
            playerId: rating.playerId,
            score: rating.score,
          },
          update: {
            score: rating.score,
          }
        })
      }
      
      // Update lastEditAt
      await tx.user.update({
        where: { id: session.user.id },
        data: { lastEditAt: new Date() }
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ratings POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
