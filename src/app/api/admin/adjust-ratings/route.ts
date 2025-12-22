import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerName, adjustment } = body

    if (!playerName || typeof adjustment !== "number") {
      return NextResponse.json(
        { error: "playerName and adjustment (number) are required" },
        { status: 400 }
      )
    }

    // Find the player
    const player = await prisma.player.findUnique({
      where: { name: playerName },
      include: {
        ratings: true,
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: `Player "${playerName}" not found` },
        { status: 404 }
      )
    }

    if (player.ratings.length === 0) {
      return NextResponse.json(
        { error: `Player "${playerName}" has no ratings` },
        { status: 400 }
      )
    }

    // Update all ratings
    const results = []
    let updatedCount = 0
    let skippedCount = 0

    for (const rating of player.ratings) {
      const newScore = rating.score + adjustment
      
      // Ensure score stays within valid range (50-99)
      if (newScore < 50) {
        results.push({
          ratingId: rating.id,
          oldScore: rating.score,
          newScore: 50,
          status: "capped_at_min",
        })
        await prisma.rating.update({
          where: { id: rating.id },
          data: { score: 50 },
        })
        updatedCount++
      } else if (newScore > 99) {
        results.push({
          ratingId: rating.id,
          oldScore: rating.score,
          newScore: 99,
          status: "capped_at_max",
        })
        await prisma.rating.update({
          where: { id: rating.id },
          data: { score: 99 },
        })
        updatedCount++
      } else {
        results.push({
          ratingId: rating.id,
          oldScore: rating.score,
          newScore: newScore,
          status: "updated",
        })
        await prisma.rating.update({
          where: { id: rating.id },
          data: { score: newScore },
        })
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} ratings for "${playerName}"`,
      playerName,
      adjustment,
      totalRatings: player.ratings.length,
      updatedCount,
      results,
    })
  } catch (error) {
    console.error("Error adjusting ratings:", error)
    return NextResponse.json(
      { error: "Failed to adjust ratings" },
      { status: 500 }
    )
  }
}

