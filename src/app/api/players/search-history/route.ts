import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const players = await prisma.player.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        category: true,
        clan: true,
        nationality: true,
        avatar: true,
        isLegend: true,
      },
      take: 15,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error("Player search-history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
