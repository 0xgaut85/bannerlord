import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_WEIGHTS, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

function isSystemRater(discordId: string | null): boolean {
  return discordId?.startsWith("system_") ?? false
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const includeLegends = searchParams.get("legends") === "true"
    
    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Search players by name (include legends if requested)
    const players = await prisma.player.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        },
        // If not specifically requesting legends, include all
        ...(includeLegends ? {} : {})
      },
      include: {
        ratings: {
          include: {
            rater: {
              select: { division: true, discordId: true }
            }
          }
        }
      },
      take: 20
    })

    // Get clan logos
    const clans = await prisma.clan.findMany({
      select: { shortName: true, logo: true }
    })
    const clanLogos = Object.fromEntries(clans.map(c => [c.shortName, c.logo]))

    // Calculate ratings and format response (legends are rated normally)
    const results = players.map(player => {
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
        averageRating = player.division 
          ? DIVISION_DEFAULT_RATINGS[player.division] 
          : 70
      }

      return {
        id: player.id,
        name: player.name,
        category: player.category,
        nationality: player.nationality,
        clan: player.clan,
        avatar: player.avatar,
        clanLogo: player.clan ? clanLogos[player.clan] || null : null,
        averageRating: Math.round(averageRating * 10) / 10,
        isLegend: player.isLegend,
      }
    })

    // Sort by rating
    results.sort((a, b) => b.averageRating - a.averageRating)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Player search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

