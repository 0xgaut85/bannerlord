import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Threshold for detecting anomalies (ratings that deviate more than this from average)
const ANOMALY_THRESHOLD = 10
// Thresholds for suspicious boost detection
const BOOST_MIN_RATINGS = 3 // Less than this number of ratings
const BOOST_AVG_THRESHOLD = 90 // Average must be above this

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Check if a rater is a system user (used for default ratings)
function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

interface Anomaly {
  id: string
  type: "deviation" | "suspicious_boost"
  playerId: string
  playerName: string
  raterId: string
  raterName: string
  raterDivision: string | null
  score: number
  averageScore: number
  deviation: number
  otherRatings: number[]
  ratingCount?: number // Number of ratings for boost detection
}

export async function GET() {
  try {
    // Get skipped anomalies from settings
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" },
      select: { skippedAnomalies: true },
    })
    const skippedAnomalyIds = new Set(settings?.skippedAnomalies || [])

    // Get all players with their ratings - fresh from DB
    const players = await prisma.player.findMany({
      include: {
        ratings: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                discordName: true,
                discordId: true,
                division: true,
              }
            }
          }
        }
      }
    })

    const anomalies: Anomaly[] = []

    for (const player of players) {
      // Filter to only real user ratings (exclude system ratings)
      const realRatings = player.ratings.filter(r => !isSystemRater(r.rater.discordId))
      
      if (realRatings.length === 0) continue
      
      // Calculate average from real ratings
      const scores = realRatings.map(r => r.score)
      const average = scores.reduce((a, b) => a + b, 0) / scores.length
      
      // DETECTOR 1: Suspicious boost - player with <3 ratings and average above 90
      if (realRatings.length < BOOST_MIN_RATINGS && average >= BOOST_AVG_THRESHOLD) {
        // Add each rating as a boost anomaly (so they can be deleted individually)
        for (const rating of realRatings) {
          // Skip if this rating was marked as safe
          if (skippedAnomalyIds.has(rating.id)) continue
          const otherRatings = realRatings
            .filter(r => r.id !== rating.id)
            .map(r => r.score)
            .sort((a, b) => b - a)
            
          anomalies.push({
            id: rating.id,
            type: "suspicious_boost",
            playerId: player.id,
            playerName: player.name,
            raterId: rating.rater.id,
            raterName: rating.rater.discordName || rating.rater.name || "Unknown",
            raterDivision: rating.rater.division,
            score: rating.score,
            averageScore: Math.round(average * 10) / 10,
            deviation: Math.round((average - 75) * 10) / 10, // Deviation from "normal" rating of 75
            otherRatings,
            ratingCount: realRatings.length,
          })
        }
        continue // Skip deviation check for this player
      }
      
      // DETECTOR 2: Deviation anomalies - need at least 2 real ratings
      if (realRatings.length < 2) continue

      // Find anomalies (only check real user ratings)
      for (const rating of realRatings) {
        // Skip if this rating was marked as safe
        if (skippedAnomalyIds.has(rating.id)) continue
        
        const deviation = Math.abs(rating.score - average)
        
        if (deviation >= ANOMALY_THRESHOLD) {
          // Get other real ratings (excluding this one) for context
          const otherRatings = realRatings
            .filter(r => r.id !== rating.id)
            .map(r => r.score)
            .sort((a, b) => b - a)

          anomalies.push({
            id: rating.id,
            type: "deviation",
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

    // Sort: suspicious boosts first, then by deviation (highest first)
    anomalies.sort((a, b) => {
      if (a.type === "suspicious_boost" && b.type !== "suspicious_boost") return -1
      if (a.type !== "suspicious_boost" && b.type === "suspicious_boost") return 1
      return b.deviation - a.deviation
    })

    return NextResponse.json(anomalies)
  } catch (error) {
    console.error("Anomalies GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

