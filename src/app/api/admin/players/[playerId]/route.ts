import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const resolvedParams = await params
    await prisma.player.delete({
      where: { id: resolvedParams.playerId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    const updated = await prisma.player.update({
      where: { id: resolvedParams.playerId },
      data: {
        clan: body.clan,
        nationality: body.nationality,
        category: body.category,
      }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}



