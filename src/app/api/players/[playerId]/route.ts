import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        ratings: {
          include: {
            rater: {
              select: { division: true, discordId: true }
            }
          }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Get clan logo
    let clanLogo = null
    if (player.clan) {
      const clan = await prisma.clan.findFirst({
        where: { shortName: player.clan },
        select: { logo: true }
      })
      clanLogo = clan?.logo || null
    }

    // Calculate rating (legends are rated normally like everyone else)
    let averageRating: number
    const realRatings = player.ratings.filter(r => !isSystemRater(r.rater.discordId))
    if (realRatings.length > 0) {
      let weightedSum = 0
      let totalWeight = 0
      for (const rating of realRatings) {
        const weight = rating.rater.division 
          ? DIVISION_WEIGHTS[rating.rater.division] 
          : 0.5
        weightedSum += rating.score * weight
        totalWeight += weight
      }
      averageRating = totalWeight > 0 ? weightedSum / totalWeight : 70
    } else {
      // Default rating for unrated players
      averageRating = player.division 
        ? DIVISION_DEFAULT_RATINGS[player.division] 
        : 70
    }

    return NextResponse.json({
      id: player.id,
      name: player.name,
      category: player.category,
      nationality: player.nationality,
      clan: player.clan,
      avatar: player.avatar,
      clanLogo,
      averageRating: Math.round(averageRating * 10) / 10,
      isLegend: player.isLegend,
    })
  } catch (error) {
    console.error("Player GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
