import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Clan edits are applied immediately (no admin approval needed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { clanId, clanShortName, suggestedName, suggestedShortName, suggestedYear, suggestedLogo } = body
    
    console.log("Clan edit request received:", {
      userId: session.user.id,
      clanId,
      clanShortName,
      suggestedName,
      suggestedShortName,
      suggestedLogo: suggestedLogo ? "yes (length: " + suggestedLogo.length + ")" : "no",
    })
    
    // Try to find the clan by ID first, then by shortName
    let clan = null
    
    if (clanId && !clanId.startsWith("player-clan-")) {
      clan = await prisma.clan.findUnique({
        where: { id: clanId }
      })
    }
    
    // If not found by ID, try by shortName
    if (!clan && clanShortName) {
      clan = await prisma.clan.findFirst({
        where: {
          OR: [
            { shortName: clanShortName },
            { name: clanShortName }
          ]
        }
      })
    }
    
    if (clan) {
      // Update existing clan
      await prisma.clan.update({
        where: { id: clan.id },
        data: {
          ...(suggestedName && { name: suggestedName }),
          ...(suggestedShortName && { shortName: suggestedShortName }),
          ...(suggestedLogo && { logo: suggestedLogo }),
        }
      })
      
      return NextResponse.json({ 
        message: "Clan updated successfully",
        applied: true
      })
    } else if (clanShortName || suggestedShortName) {
      // Create new clan if it doesn't exist
      const shortName = suggestedShortName || clanShortName
      const name = suggestedName || shortName
      
      await prisma.clan.create({
        data: {
          name,
          shortName,
          logo: suggestedLogo || null,
        }
      })
      
      return NextResponse.json({ 
        message: "Clan created successfully",
        applied: true
      })
    }
    
    return NextResponse.json({ error: "Could not identify clan to update" }, { status: 400 })
  } catch (error) {
    console.error("Clan request POST error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

