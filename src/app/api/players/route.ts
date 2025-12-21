import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PlayerCategory } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as PlayerCategory | null
    const search = searchParams.get("search")
    
    const where: {
      category?: PlayerCategory
      name?: { contains: string; mode: "insensitive" }
    } = {}
    
    if (category && Object.values(PlayerCategory).includes(category)) {
      where.category = category
    }
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }
    
    const players = await prisma.player.findMany({
      where,
      orderBy: { name: "asc" },
    })
    
    return NextResponse.json(players)
  } catch (error) {
    console.error("Players GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


