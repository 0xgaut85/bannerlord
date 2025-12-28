import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Predefined list of raters who can participate
const CURATED_RATERS = [
  "Rater 1",
  "Rater 2", 
  "Rater 3",
  "Rater 4",
  "Rater 5",
  "Rater 6",
  "Rater 7",
  "Rater 8",
  "Rater 9",
  "Rater 10"
]

// GET - Get list of predefined raters
export async function GET() {
  try {
    // Get active session to see who has already rated
    const activeSession = await prisma.curatedSession.findFirst({
      where: { isActive: true },
      include: {
        ratings: true
      }
    })

    const ratersWithStatus = CURATED_RATERS.map(name => {
      const rating = activeSession?.ratings.find(r => r.raterName === name)
      return {
        name,
        hasRated: !!rating?.score,
        score: rating?.score || null
      }
    })

    return NextResponse.json({
      raters: ratersWithStatus,
      predefinedRaters: CURATED_RATERS
    })
  } catch (error) {
    console.error("Error fetching raters:", error)
    return NextResponse.json({ error: "Failed to fetch raters" }, { status: 500 })
  }
}

