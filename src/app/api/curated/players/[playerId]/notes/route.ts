import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get all notes for a curated player
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    // Get the curated ranking for this player
    const curatedRanking = await prisma.curatedRanking.findUnique({
      where: { playerId }
    })

    if (!curatedRanking) {
      return NextResponse.json({ error: "Player not found in curated rankings" }, { status: 404 })
    }

    // Get all confirmed sessions for this player with their ratings/notes
    const sessions = await prisma.curatedSession.findMany({
      where: {
        playerId,
        isConfirmed: true
      },
      include: {
        ratings: {
          where: {
            score: { not: null }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Flatten all ratings with notes from all sessions
    const allRatings = sessions.flatMap(session => 
      session.ratings.map(r => ({
        id: r.id,
        raterName: r.raterName,
        score: r.score,
        note: r.note,
        sessionDate: session.createdAt
      }))
    )

    // Get the most recent rating per rater (in case of multiple sessions)
    const latestRatings = allRatings.reduce((acc, rating) => {
      if (!acc[rating.raterName] || new Date(rating.sessionDate) > new Date(acc[rating.raterName].sessionDate)) {
        acc[rating.raterName] = rating
      }
      return acc
    }, {} as Record<string, typeof allRatings[0]>)

    const ratingsWithNotes = Object.values(latestRatings)

    return NextResponse.json({
      player: {
        id: curatedRanking.playerId,
        name: curatedRanking.playerName,
        category: curatedRanking.category,
        nationality: curatedRanking.nationality,
        clan: curatedRanking.clan,
        rating: curatedRanking.rating
      },
      ratings: ratingsWithNotes
    })
  } catch (error) {
    console.error("Error fetching player notes:", error)
    return NextResponse.json({ error: "Failed to fetch player notes" }, { status: 500 })
  }
}

