import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Clan edits go through admin review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { clanId, clanShortName, suggestedName, suggestedShortName, suggestedLogo } = body
    
    if (!clanShortName && !suggestedShortName) {
      return NextResponse.json({ error: "Clan identifier required" }, { status: 400 })
    }
    
    const shortNameToUse = clanShortName || suggestedShortName
    
    // Check if there's already a pending request for this clan
    const existingRequest = await prisma.clanEditRequest.findFirst({
      where: {
        clanShortName: shortNameToUse,
        status: "PENDING"
      }
    })
    
    if (existingRequest) {
      return NextResponse.json({ 
        error: "There is already a pending edit request for this clan" 
      }, { status: 400 })
    }
    
    // Try to find the clan to get the ID
    let clan = null
    if (clanId && !clanId.startsWith("player-clan-")) {
      clan = await prisma.clan.findUnique({ where: { id: clanId } })
    }
    if (!clan && shortNameToUse) {
      clan = await prisma.clan.findFirst({
        where: {
          OR: [
            { shortName: shortNameToUse },
            { name: shortNameToUse }
          ]
        }
      })
    }
    
    // Create the edit request for admin review
    await prisma.clanEditRequest.create({
      data: {
        clanId: clan?.id || null,
        clanShortName: shortNameToUse,
        userId: session.user.id,
        suggestedName: suggestedName || null,
        suggestedShortName: suggestedShortName || null,
        suggestedLogo: suggestedLogo || null,
      }
    })
    
    return NextResponse.json({ 
      message: "Clan edit request submitted for admin review",
      pending: true
    })
  } catch (error) {
    console.error("Clan request POST error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

// GET endpoint to fetch clan edit requests (for admin)
export async function GET() {
  try {
    const requests = await prisma.clanEditRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { name: true, discordName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Clan request GET error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

