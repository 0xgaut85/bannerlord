import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Confirm the current session (streamer only)
export async function POST(request: NextRequest) {
  try {
    const { streamerCode } = await request.json()

    // Verify streamer code
    if (streamerCode !== "MRASH") {
      return NextResponse.json({ error: "Invalid streamer code" }, { status: 403 })
    }

    // Get active session with ratings
    const activeSession = await prisma.curatedSession.findFirst({
      where: { isActive: true },
      include: {
        ratings: {
          where: { score: { not: null } }
        }
      }
    })

    if (!activeSession) {
      return NextResponse.json({ error: "No active session" }, { status: 404 })
    }

    if (activeSession.isConfirmed) {
      return NextResponse.json({ error: "Session already confirmed" }, { status: 400 })
    }

    // Calculate average rating
    const validRatings = activeSession.ratings.filter(r => r.score !== null)
    if (validRatings.length === 0) {
      return NextResponse.json({ error: "No valid ratings to confirm" }, { status: 400 })
    }

    const averageRating = validRatings.reduce((sum, r) => sum + (r.score || 0), 0) / validRatings.length
    const roundedRating = Math.round(averageRating * 10) / 10

    // Update session as confirmed
    await prisma.curatedSession.update({
      where: { id: activeSession.id },
      data: {
        isConfirmed: true,
        isActive: false,
        finalRating: roundedRating
      }
    })

    // Upsert into curated rankings
    await prisma.curatedRanking.upsert({
      where: { playerId: activeSession.playerId },
      update: {
        playerName: activeSession.playerName,
        category: activeSession.category,
        nationality: activeSession.nationality,
        clan: activeSession.clan,
        rating: roundedRating,
        confirmedAt: new Date()
      },
      create: {
        playerId: activeSession.playerId,
        playerName: activeSession.playerName,
        category: activeSession.category,
        nationality: activeSession.nationality,
        clan: activeSession.clan,
        rating: roundedRating
      }
    })

    return NextResponse.json({ 
      success: true, 
      rating: roundedRating,
      playerName: activeSession.playerName 
    })
  } catch (error) {
    console.error("Error confirming curated session:", error)
    return NextResponse.json({ error: "Failed to confirm session" }, { status: 500 })
  }
}

