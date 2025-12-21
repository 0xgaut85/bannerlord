import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    const editRequest = await prisma.clanEditRequest.findUnique({
      where: { id: params.requestId }
    })
    
    if (!editRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    
    if (editRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 })
    }
    
    if (action === "approve") {
      // Find or create the clan and apply the changes
      let clan = null
      
      if (editRequest.clanId) {
        clan = await prisma.clan.findUnique({ where: { id: editRequest.clanId } })
      }
      
      if (!clan) {
        // Try to find by shortName
        clan = await prisma.clan.findFirst({
          where: {
            OR: [
              { shortName: editRequest.clanShortName },
              { name: editRequest.clanShortName }
            ]
          }
        })
      }
      
      if (clan) {
        // Update existing clan
        await prisma.clan.update({
          where: { id: clan.id },
          data: {
            ...(editRequest.suggestedName && { name: editRequest.suggestedName }),
            ...(editRequest.suggestedShortName && { shortName: editRequest.suggestedShortName }),
            ...(editRequest.suggestedLogo && { logo: editRequest.suggestedLogo }),
          }
        })
      } else {
        // Create new clan
        await prisma.clan.create({
          data: {
            name: editRequest.suggestedName || editRequest.clanShortName,
            shortName: editRequest.suggestedShortName || editRequest.clanShortName,
            logo: editRequest.suggestedLogo || null,
          }
        })
      }
      
      // Mark request as approved
      await prisma.clanEditRequest.update({
        where: { id: params.requestId },
        data: { status: "APPROVED" }
      })
      
      return NextResponse.json({ message: "Clan edit approved and applied" })
    } else {
      // Reject
      await prisma.clanEditRequest.update({
        where: { id: params.requestId },
        data: { status: "REJECTED" }
      })
      
      return NextResponse.json({ message: "Clan edit rejected" })
    }
  } catch (error) {
    console.error("Clan request PATCH error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}


