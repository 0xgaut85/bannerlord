import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, MIN_RATINGS, filterRatingsForPlayer } from "@/lib/utils"

export const dynamic = 'force-dynamic'

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
        select: { player: { select: { category: true } } }
      }
    }
  })

  const ids: string[] = []
  for (const user of users) {
    if (user.discordId?.startsWith("system_")) { ids.push(user.id); continue }
    const inf = user.ratings.filter(r => r.player.category === "INFANTRY").length
    const cav = user.ratings.filter(r => r.player.category === "CAVALRY").length
    const arc = user.ratings.filter(r => r.player.category === "ARCHER").length
    if (inf >= MIN_RATINGS.INFANTRY && cav >= MIN_RATINGS.CAVALRY && arc >= MIN_RATINGS.ARCHER) {
      ids.push(user.id)
    }
  }
  return ids
}

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

    const eligibleUserIds = await getEligibleUserIds()
    
    // Get all players with ratings from eligible users only
    const players = await prisma.player.findMany({
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
      const rawRatings = player.ratings.filter(r => !r.rater.discordId?.startsWith("system_") && !r.isMuted)
      const realRatings = filterRatingsForPlayer(player.name, rawRatings)
      
      if (realRatings.length < 2) continue

      let weightedSum = 0
      let totalWeight = 0
      
      for (const rating of realRatings) {
        const weight = rating.rater.division 
          ? DIVISION_WEIGHTS[rating.rater.division] 
          : 0.075
        weightedSum += rating.score * weight
        totalWeight += weight
      }
      
      const averageRating = totalWeight > 0 ? weightedSum / totalWeight : 70

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


