import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Submit or update a rating
export async function POST(request: NextRequest) {
  try {
    const { raterName, score, note, raterCode } = await request.json()

    // Verify rater code
    if (raterCode !== "OBELIXNW" && raterCode !== "MRASH") {
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
        note: trimmedNote
      },
      create: {
        sessionId: activeSession.id,
        raterName: raterName,
        score: parsedScore,
        note: trimmedNote
      }
    })

    return NextResponse.json(rating)
  } catch (error) {
    console.error("Error submitting curated rating:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
}

