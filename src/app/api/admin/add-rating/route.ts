import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { raterName, playerName, score } = await request.json()

    if (!raterName || !playerName || score === undefined) {
      return NextResponse.json({ error: "raterName, playerName, and score are required" }, { status: 400 })
    }

    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 50 || scoreNum > 99) {
      return NextResponse.json({ error: "Score must be between 50 and 99" }, { status: 400 })
    }

    const player = await prisma.player.findFirst({
      where: { name: { equals: playerName, mode: "insensitive" } },
    })
    if (!player) {
      return NextResponse.json({ error: `Player "${playerName}" not found` }, { status: 404 })
    }

    const rater = await prisma.user.findFirst({
      where: {
        OR: [
          { discordName: { equals: raterName, mode: "insensitive" } },
          { name: { equals: raterName, mode: "insensitive" } },
        ],
      },
    })
    if (!rater) {
      return NextResponse.json({ error: `User "${raterName}" not found` }, { status: 404 })
    }

    const rating = await prisma.rating.upsert({
      where: {
        raterId_playerId: {
          raterId: rater.id,
          playerId: player.id,
        },
      },
      update: { score: scoreNum },
      create: {
        raterId: rater.id,
        playerId: player.id,
        score: scoreNum,
      },
    })

    return NextResponse.json({
      success: true,
      message: `${rater.discordName || rater.name} rated ${player.name} → ${scoreNum}`,
      ratingId: rating.id,
      isUpdate: rating.updatedAt > rating.createdAt,
    })
  } catch (error: any) {
    console.error("Add rating error:", error)
    return NextResponse.json({ error: "Failed to add rating" }, { status: 500 })
  }
}
