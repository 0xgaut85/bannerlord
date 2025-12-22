import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        category: true,
        clan: true,
        nationality: true,
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
          },
          orderBy: { score: "desc" }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Filter out system ratings and format the response
    const realRatings = player.ratings
      .filter(r => !r.rater.discordId?.startsWith("system_"))
      .map(r => ({
        id: r.id,
        score: r.score,
        raterName: r.rater.name,
        raterDiscordName: r.rater.discordName,
        raterDivision: r.rater.division,
      }))

    // Calculate average from real ratings
    const average = realRatings.length > 0
      ? realRatings.reduce((sum, r) => sum + r.score, 0) / realRatings.length
      : null

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        category: player.category,
        clan: player.clan,
        nationality: player.nationality,
      },
      ratings: realRatings,
      averageRating: average ? Math.round(average * 10) / 10 : null,
      totalRatings: realRatings.length,
    })
  } catch (error) {
    console.error("Player ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


