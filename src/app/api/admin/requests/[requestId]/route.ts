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
      // Update player with suggestions
      await prisma.player.update({
        where: { id: editRequest.playerId },
        data: {
          nationality: editRequest.suggestedNationality || editRequest.player.nationality,
          clan: editRequest.suggestedClan || editRequest.player.clan
        }
      })
      
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
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

