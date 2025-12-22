import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params
    const body = await request.json()
    const { action } = body // "approve" or "reject"
    
    const editRequest = await prisma.editRequest.findUnique({
      where: { id: requestId },
      include: { player: true }
    })
    
    if (!editRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    
    if (action === "approve") {
      // Build update data - only include fields that have suggested changes
      const updateData: Record<string, any> = {}
      
      if (editRequest.suggestedName) {
        // Check if the new name already exists (and it's not the same player)
        const existingPlayer = await prisma.player.findUnique({
          where: { name: editRequest.suggestedName }
        })
        
        if (existingPlayer && existingPlayer.id !== editRequest.playerId) {
          // Name exists - only allow if the player being updated is a legend
          if (editRequest.player.isLegend) {
            // Allow legend to have duplicate name with suffix
            updateData.name = `${editRequest.suggestedName} (Legend)`
          } else {
            return NextResponse.json({ 
              error: "A player with this name already exists" 
            }, { status: 400 })
          }
        } else {
          updateData.name = editRequest.suggestedName
        }
      }
      if (editRequest.suggestedNationality) {
        updateData.nationality = editRequest.suggestedNationality
      }
      if (editRequest.suggestedClan) {
        updateData.clan = editRequest.suggestedClan
      }
      if (editRequest.suggestedBio) {
        updateData.bio = editRequest.suggestedBio
      }
      if (editRequest.suggestedAvatar) {
        updateData.avatar = editRequest.suggestedAvatar
      }
      if (editRequest.suggestedDivision) {
        updateData.division = editRequest.suggestedDivision
      }
      if (editRequest.suggestedCategory) {
        updateData.category = editRequest.suggestedCategory
      }
      
      // Update player with suggestions
      if (Object.keys(updateData).length > 0) {
        await prisma.player.update({
          where: { id: editRequest.playerId },
          data: updateData
        })
      }
      
      // Update request status
      await prisma.editRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      })
    } else if (action === "reject") {
      await prisma.editRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Request action error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
