import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { DIVISION_DEFAULT_RATINGS } from "@/lib/utils"
import { Division } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const resolvedParams = await params
    const { action } = await request.json()
    
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    const playerRequest = await prisma.playerCreateRequest.findUnique({
      where: { id: resolvedParams.requestId }
    })
    
    if (!playerRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    
    if (action === "approve") {
      // Check if player name is still available - allow duplicate names for legends
      const existingPlayer = await prisma.player.findUnique({
        where: { name: playerRequest.playerName }
      })
      
      if (existingPlayer && !playerRequest.isLegend) {
        // Reject the request since player now exists (only for non-legends)
        await prisma.playerCreateRequest.update({
          where: { id: resolvedParams.requestId },
          data: { status: "REJECTED" }
        })
        return NextResponse.json({ error: "Player with this name already exists" }, { status: 400 })
      }
      
      // For legends with existing name, use name with suffix
      let finalName = playerRequest.playerName
      if (existingPlayer && playerRequest.isLegend) {
        finalName = `${playerRequest.playerName} (Legend)`
      }
      
      // Create the player
      const newPlayer = await prisma.player.create({
        data: {
          name: finalName,
          category: playerRequest.category,
          division: playerRequest.division,
          nationality: playerRequest.nationality,
          clan: playerRequest.clan,
          bio: playerRequest.bio,
          avatar: playerRequest.avatar,
          isLegend: playerRequest.isLegend || false,
        }
      })
      
      // Create default ratings from system raters if division is set (not for legends)
      if (playerRequest.division && !playerRequest.isLegend) {
        const systemRaters = await prisma.user.findMany({
          where: { discordId: { startsWith: "system_" } }
        })
        
        const defaultRating = DIVISION_DEFAULT_RATINGS[playerRequest.division as Division] || 70
        
        for (const rater of systemRaters) {
          await prisma.rating.create({
            data: {
              score: defaultRating,
              raterId: rater.id,
              playerId: newPlayer.id,
            }
          })
        }
      }
      
      // Update request status
      await prisma.playerCreateRequest.update({
        where: { id: resolvedParams.requestId },
        data: { status: "APPROVED" }
      })
      
      return NextResponse.json({ message: "Player created successfully", player: newPlayer })
    } else {
      // Reject the request
      await prisma.playerCreateRequest.update({
        where: { id: resolvedParams.requestId },
        data: { status: "REJECTED" }
      })
      
      return NextResponse.json({ message: "Request rejected" })
    }
  } catch (error) {
    console.error("Player request PATCH error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}


