import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { playerId } = await params
    const body = await request.json()
    const { nationality, clan } = body
    
    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })
    
    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      )
    }
    
    // Update player
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        nationality: nationality || null,
        clan: clan || null,
      },
    })
    
    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params
    
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })
    
    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(player)
  } catch (error) {
    console.error("Error fetching player:", error)
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    )
  }
}


