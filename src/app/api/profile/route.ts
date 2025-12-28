import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Division } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        discordName: true,
        team: true,
        division: true,
        lastEditAt: true,
        isProfileComplete: true,
        image: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { team, division } = body
    
    // Validate division
    if (division && !Object.values(Division).includes(division)) {
      return NextResponse.json({ error: "Invalid division" }, { status: 400 })
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        team: team || null,
        division: division || null,
        isProfileComplete: !!(team && division),
      },
      select: {
        id: true,
        name: true,
        discordName: true,
        team: true,
        division: true,
        lastEditAt: true,
        isProfileComplete: true,
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}















