import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get curated rankings statistics
export async function GET() {
  try {
    const [rankings, sessions, raters] = await Promise.all([
      prisma.curatedRanking.count(),
      prisma.curatedSession.count(),
      prisma.curatedRating.count()
    ])

    return NextResponse.json({
      rankings,
      sessions,
      raters
    })
  } catch (error) {
    console.error("Error fetching curated stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

