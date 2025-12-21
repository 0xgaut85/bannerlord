import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// For now, we'll store clan edit requests as edit requests with a special format
// In the future, we could create a separate ClanEditRequest model
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { clanId, suggestedName, suggestedShortName, suggestedYear, suggestedLogo } = body
    
    if (!clanId) {
      return NextResponse.json({ error: "Clan ID required" }, { status: 400 })
    }
    
    // For now, we'll log this and return success
    // In a real implementation, you'd want to store this in a separate table
    // or extend the EditRequest model to handle clan edits
    console.log("Clan edit request received:", {
      userId: session.user.id,
      clanId,
      suggestedName,
      suggestedShortName,
      suggestedYear,
      suggestedLogo: suggestedLogo ? "yes" : "no",
    })
    
    // Check if clan exists
    const clan = await prisma.clan.findUnique({
      where: { id: clanId }
    })
    
    // If it's a player-clan (fake ID), we just accept the request
    if (!clan && !clanId.startsWith("player-clan-")) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 })
    }
    
    // If the clan exists in the Clan table, update it directly
    // (For now, since we don't have admin review for clans yet)
    if (clan) {
      await prisma.clan.update({
        where: { id: clanId },
        data: {
          ...(suggestedName && { name: suggestedName }),
          ...(suggestedShortName && { shortName: suggestedShortName }),
          ...(suggestedLogo && { logo: suggestedLogo }),
          // Note: year field doesn't exist in schema yet
        }
      })
    }
    
    return NextResponse.json({ 
      message: "Clan edit request submitted successfully",
      applied: !!clan
    })
  } catch (error) {
    console.error("Clan request POST error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

