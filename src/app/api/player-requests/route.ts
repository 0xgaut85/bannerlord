import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Submit a new player creation request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { playerName, category, division, nationality, clan, bio, avatar } = body
    
    if (!playerName || !category) {
      return NextResponse.json({ error: "Player name and category are required" }, { status: 400 })
    }
    
    // Check if player already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { name: playerName }
    })
    
    if (existingPlayer) {
      return NextResponse.json({ error: "A player with this name already exists" }, { status: 400 })
    }
    
    // Check if there's already a pending request for this player name
    const existingRequest = await prisma.playerCreateRequest.findFirst({
      where: {
        playerName,
        status: "PENDING"
      }
    })
    
    if (existingRequest) {
      return NextResponse.json({ error: "A request to create this player is already pending" }, { status: 400 })
    }
    
    // Create the request
    await prisma.playerCreateRequest.create({
      data: {
        userId: session.user.id,
        playerName,
        category,
        division: division || null,
        nationality: nationality || null,
        clan: clan || null,
        bio: bio || null,
        avatar: avatar || null,
      }
    })
    
    return NextResponse.json({ message: "Player creation request submitted for admin review" })
  } catch (error) {
    console.error("Player request POST error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

// Get player creation requests (for admin)
export async function GET() {
  try {
    const requests = await prisma.playerCreateRequest.findMany({
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
    console.error("Player request GET error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}


