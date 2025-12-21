import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where = search 
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}

    const players = await prisma.player.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50
    })

    return NextResponse.json(players)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

