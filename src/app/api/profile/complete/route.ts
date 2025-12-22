import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, team, division } = body
    
    if (!name || !division) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Update user profile and mark as complete
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordName: name, // We store the in-game name in the display name field
        team: team || null,
        division,
        isProfileComplete: true,
      }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



