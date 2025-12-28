import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get all curated rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where = category && category !== "ALL" 
      ? { category: category as "INFANTRY" | "CAVALRY" | "ARCHER" }
      : {}

    const rankings = await prisma.curatedRanking.findMany({
      where,
      orderBy: { rating: 'desc' }
    })

    // Get player avatars
    const playerIds = rankings.map(r => r.playerId)
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, avatar: true }
    })
    const avatarMap = Object.fromEntries(players.map(p => [p.id, p.avatar]))

    // Get clan logos
    const clanNames = [...new Set(rankings.map(r => r.clan).filter(Boolean))]
    const clans = await prisma.clan.findMany({
      where: { shortName: { in: clanNames as string[] } },
      select: { shortName: true, logo: true }
    })
    const clanLogoMap = Object.fromEntries(clans.map(c => [c.shortName, c.logo]))

    const rankingsWithAvatars = rankings.map(r => ({
      ...r,
      avatar: avatarMap[r.playerId] || null,
      clanLogo: r.clan ? clanLogoMap[r.clan] || null : null
    }))

    return NextResponse.json(rankingsWithAvatars)
  } catch (error) {
    console.error("Error fetching curated rankings:", error)
    return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 })
  }
}

