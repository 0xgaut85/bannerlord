import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, category, nationality, clan, bio } = body
    
    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }
    
    if (!Object.values(PlayerCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    
    // Check if player already exists
    const existing = await prisma.player.findUnique({
      where: { name }
    })
    
    if (existing) {
      return NextResponse.json({ error: "A player with this name already exists" }, { status: 400 })
    }
    
    const player = await prisma.player.create({
      data: {
        name,
        category,
        nationality: nationality || null,
        clan: clan || null,
        bio: bio?.slice(0, 240) || null,
      }
    })
    
    return NextResponse.json(player)
  } catch (error) {
    console.error("Players POST error:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}


