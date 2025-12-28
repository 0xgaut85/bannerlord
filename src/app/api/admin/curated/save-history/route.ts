import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Save current curated rankings to history
export async function POST(request: NextRequest) {
  try {
    const { periodName } = await request.json()
    
    if (!periodName || periodName.trim().length === 0) {
      return NextResponse.json({ error: "Period name is required" }, { status: 400 })
    }

    // Get all current curated rankings
    const currentRankings = await prisma.curatedRanking.findMany({
      orderBy: { rating: "desc" }
    })

    if (currentRankings.length === 0) {
      return NextResponse.json({ error: "No curated rankings to save" }, { status: 400 })
    }

    // Create the period and historical rankings in a transaction
    const period = await prisma.curatedRankingPeriod.create({
      data: {
        name: periodName.trim(),
        rankings: {
          create: currentRankings.map((ranking, index) => ({
            playerId: ranking.playerId,
            playerName: ranking.playerName,
            category: ranking.category,
            nationality: ranking.nationality,
            clan: ranking.clan,
            rating: ranking.rating,
            rank: index + 1
          }))
        }
      },
      include: {
        rankings: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      period,
      message: `Saved ${currentRankings.length} rankings to "${periodName}"` 
    })
  } catch (error: any) {
    console.error("Error saving curated rankings to history:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A period with this name already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to save curated rankings" }, { status: 500 })
  }
}

// GET - Get all curated ranking periods
export async function GET() {
  try {
    const periods = await prisma.curatedRankingPeriod.findMany({
      orderBy: { savedAt: "desc" },
      include: {
        _count: {
          select: { rankings: true }
        }
      }
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error("Error fetching curated periods:", error)
    return NextResponse.json({ error: "Failed to fetch periods" }, { status: 500 })
  }
}

