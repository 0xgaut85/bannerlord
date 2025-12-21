import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Division, PlayerCategory } from "@prisma/client"

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, clan, nationality, category, division } = body
    
    if (!id) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    
    if (clan !== undefined) updateData.clan = clan || null
    if (nationality !== undefined) updateData.nationality = nationality || null
    if (category && Object.values(PlayerCategory).includes(category)) {
      updateData.category = category
    }
    if (division !== undefined) {
      updateData.division = division && Object.values(Division).includes(division) ? division : null
    }

    const player = await prisma.player.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error("Player update error:", error)
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    await prisma.player.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Player delete error:", error)
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 })
  }
}
