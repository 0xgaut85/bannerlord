import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Submit or update a rating
export async function POST(request: NextRequest) {
  try {
    const { raterName, score, note, raterCode, confirmed } = await request.json()

    // Verify rater code from environment variables (streamer can also rate)
    const validStreamerCode = process.env.CURATED_STREAMER_CODE
    const validRaterCode = process.env.CURATED_RATER_CODE
    if (raterCode !== validRaterCode && raterCode !== validStreamerCode) {
      return NextResponse.json({ error: "Invalid rater code" }, { status: 403 })
    }

    // Get active session
    const activeSession = await prisma.curatedSession.findFirst({
      where: { isActive: true }
    })

    if (!activeSession) {
      return NextResponse.json({ error: "No active session" }, { status: 404 })
    }

    if (activeSession.isConfirmed) {
      return NextResponse.json({ error: "Session already confirmed" }, { status: 400 })
    }

    // Check if rater already confirmed - if so, they need to "edit" first
    const existingRating = await prisma.curatedRating.findUnique({
      where: {
        sessionId_raterName: {
          sessionId: activeSession.id,
          raterName: raterName
        }
      }
    })

    // If rating is confirmed and this is not an explicit edit (confirmed=false), reject score/note updates
    if (existingRating?.confirmed && confirmed !== false) {
      // Only allow confirming again or editing (setting confirmed to false)
      if (confirmed === true) {
        // Already confirmed, just return success
        return NextResponse.json(existingRating)
      }
      return NextResponse.json({ error: "Rating is locked. Click Edit to modify." }, { status: 400 })
    }

    // Validate score
    const parsedScore = score !== null && score !== "" ? parseInt(score) : null
    if (parsedScore !== null && (parsedScore < 50 || parsedScore > 99)) {
      return NextResponse.json({ error: "Score must be between 50 and 99" }, { status: 400 })
    }

    // Validate note length
    const trimmedNote = note ? note.trim().slice(0, 280) : null

    // Upsert rating
    const rating = await prisma.curatedRating.upsert({
      where: {
        sessionId_raterName: {
          sessionId: activeSession.id,
          raterName: raterName
        }
      },
      update: {
        score: parsedScore,
        note: trimmedNote,
        confirmed: confirmed ?? false
      },
      create: {
        sessionId: activeSession.id,
        raterName: raterName,
        score: parsedScore,
        note: trimmedNote,
        confirmed: confirmed ?? false
      }
    })

    return NextResponse.json(rating)
  } catch (error) {
    console.error("Error submitting curated rating:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
}

