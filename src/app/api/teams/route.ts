import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Get user's saved teams
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await prisma.savedTeam.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Teams GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Save a new team or update existing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, playerIds } = await request.json()

    if (!name || !playerIds || playerIds.length !== 6) {
      return NextResponse.json({ error: "Name and exactly 6 player IDs required" }, { status: 400 })
    }

    // Upsert - update if exists, create if not
    const team = await prisma.savedTeam.upsert({
      where: {
        userId_name: {
          userId: session.user.id,
          name: name
        }
      },
      update: {
        playerIds: playerIds,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        name: name,
        playerIds: playerIds
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Teams POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a saved team
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("id")

    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 })
    }

    // Verify ownership
    const team = await prisma.savedTeam.findUnique({
      where: { id: teamId }
    })

    if (!team || team.userId !== session.user.id) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    await prisma.savedTeam.delete({
      where: { id: teamId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Teams DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


