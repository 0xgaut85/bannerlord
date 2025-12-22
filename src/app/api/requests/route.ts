import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { playerId, name, nationality, clan, bio, avatar, division, category } = body
    
    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID required" },
        { status: 400 }
      )
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      )
    }

    // If name change is requested, check if the new name already exists
    if (name && name !== player.name) {
      const existingPlayer = await prisma.player.findUnique({
        where: { name }
      })
      
      if (existingPlayer && existingPlayer.id !== playerId) {
        // Name exists - only allow if the current player is a legend
        if (!player.isLegend) {
          return NextResponse.json(
            { error: "A player with this name already exists" },
            { status: 400 }
          )
        }
        // Legends are allowed - the approval will add "(L)" suffix
      }
    }

    // Check if there is already a pending request for this player by this user
    const existingRequest = await prisma.editRequest.findFirst({
      where: {
        userId: session.user.id,
        playerId: playerId,
        status: "PENDING"
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this player" },
        { status: 400 }
      )
    }
    
    const editRequest = await prisma.editRequest.create({
      data: {
        userId: session.user.id,
        playerId,
        suggestedName: name || null,
        suggestedNationality: nationality || null,
        suggestedClan: clan || null,
        suggestedBio: bio?.slice(0, 240) || null,
        suggestedAvatar: avatar || null,
        suggestedDivision: division || null,
        suggestedCategory: category || null,
      }
    })
    
    return NextResponse.json(editRequest)
  } catch (error) {
    console.error("Error creating edit request:", error)
    // Return more specific error message
    const message = error instanceof Error ? error.message : "Failed to create request"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

