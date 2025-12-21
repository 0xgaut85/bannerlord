import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Threshold for detecting anomalies (ratings that deviate more than this from average)
const ANOMALY_THRESHOLD = 10

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all players with their ratings
    const players = await prisma.player.findMany({
      include: {
        ratings: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                discordName: true,
                division: true,
              }
            }
          }
        }
      }
    })

    const anomalies: {
      id: string
      playerId: string
      playerName: string
      raterId: string
      raterName: string
      raterDivision: string | null
      score: number
      averageScore: number
      deviation: number
      otherRatings: number[]
    }[] = []

    for (const player of players) {
      if (player.ratings.length < 2) continue // Need at least 2 ratings to detect anomalies

      // Calculate average
      const scores = player.ratings.map(r => r.score)
      const average = scores.reduce((a, b) => a + b, 0) / scores.length

      // Find anomalies
      for (const rating of player.ratings) {
        const deviation = Math.abs(rating.score - average)
        
        if (deviation >= ANOMALY_THRESHOLD) {
          // Get other ratings (excluding this one) for context
          const otherRatings = player.ratings
            .filter(r => r.id !== rating.id)
            .map(r => r.score)
            .sort((a, b) => b - a)

          anomalies.push({
            id: rating.id,
            playerId: player.id,
            playerName: player.name,
            raterId: rating.rater.id,
            raterName: rating.rater.discordName || rating.rater.name || "Unknown",
            raterDivision: rating.rater.division,
            score: rating.score,
            averageScore: Math.round(average * 10) / 10,
            deviation: Math.round(deviation * 10) / 10,
            otherRatings,
          })
        }
      }
    }

    // Sort by deviation (highest first)
    anomalies.sort((a, b) => b.deviation - a.deviation)

    return NextResponse.json(anomalies)
  } catch (error) {
    console.error("Anomalies GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

