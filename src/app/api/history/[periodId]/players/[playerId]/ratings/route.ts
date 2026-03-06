import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string; playerId: string }> }
) {
  try {
    const { periodId, playerId } = await params

    const ratings = await prisma.historicalRating.findMany({
      where: { periodId, playerId },
      select: {
        score: true,
        raterName: true,
        raterDiscordName: true,
        raterDivision: true,
      },
    })

    if (ratings.length === 0) {
      return NextResponse.json({
        ratings: [],
        averageRating: null,
        totalRatings: 0,
      })
    }

    const total = ratings.reduce((sum, r) => sum + r.score, 0)
    const averageRating = Math.round((total / ratings.length) * 10) / 10

    return NextResponse.json({
      ratings,
      averageRating,
      totalRatings: ratings.length,
    })
  } catch (error) {
    console.error("Historical ratings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch historical ratings" },
      { status: 500 }
    )
  }
}
