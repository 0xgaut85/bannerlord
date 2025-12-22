import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

// Save current rankings as a historical snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { periodName } = body
    
    if (!periodName) {
      return NextResponse.json({ error: "Period name required" }, { status: 400 })
    }
    
    // Check if period already exists
    const existingPeriod = await prisma.rankingPeriod.findUnique({
      where: { name: periodName }
    })
    
    if (existingPeriod) {
      return NextResponse.json({ error: "Period already exists" }, { status: 400 })
    }
    
    // Get all players with ratings
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
    
    // Calculate rankings
    const rankings: {
      playerId: string
      playerName: string
      category: any
      clan: string | null
      nationality: string | null
      averageRating: number
      totalRatings: number
    }[] = []
    
    for (const player of players) {
      // Filter to real ratings only
      const realRatings = player.ratings.filter(r => !r.rater.discordId?.startsWith("system_"))
      
      let averageRating: number
      
      if (realRatings.length > 0) {
        // Calculate weighted average
        let weightedSum = 0
        let totalWeight = 0
        
        for (const rating of realRatings) {
          const weight = rating.rater.division 
            ? DIVISION_WEIGHTS[rating.rater.division] 
            : 0.5
          weightedSum += rating.score * weight
          totalWeight += weight
        }
        
        averageRating = totalWeight > 0 ? weightedSum / totalWeight : 70
      } else {
        // Use default rating based on division
        averageRating = player.division 
          ? DIVISION_DEFAULT_RATINGS[player.division] 
          : 70
      }
      
      rankings.push({
        playerId: player.id,
        playerName: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: realRatings.length,
      })
    }
    
    // Sort by rating
    rankings.sort((a, b) => b.averageRating - a.averageRating)
    
    // Create period and rankings
    const now = new Date()
    const period = await prisma.rankingPeriod.create({
      data: {
        name: periodName,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
        rankings: {
          create: rankings.map((r, idx) => ({
            playerId: r.playerId,
            playerName: r.playerName,
            category: r.category,
            clan: r.clan,
            nationality: r.nationality,
            averageRating: r.averageRating,
            totalRatings: r.totalRatings,
            rank: idx + 1,
          }))
        }
      },
      include: { rankings: true }
    })
    
    return NextResponse.json({ success: true, period })
  } catch (error) {
    console.error("Snapshot POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


