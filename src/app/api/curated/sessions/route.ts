import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get current active session
export async function GET() {
  try {
    const activeSession = await prisma.curatedSession.findFirst({
      where: { isActive: true },
      include: {
        ratings: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!activeSession) {
      return NextResponse.json(null)
    }

    // Get player details for avatar
    const player = await prisma.player.findUnique({
      where: { id: activeSession.playerId },
      select: { avatar: true, clan: true }
    })

    // Get clan logo if player has a clan
    let clanLogo = null
    if (activeSession.clan) {
      const clan = await prisma.clan.findFirst({
        where: {
          OR: [
            { shortName: activeSession.clan },
            { name: activeSession.clan }
          ]
        },
        select: { logo: true }
      })
      clanLogo = clan?.logo || null
    }

    return NextResponse.json({
      ...activeSession,
      avatar: player?.avatar || null,
      clanLogo
    })
  } catch (error) {
    console.error("Error fetching curated session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

// POST - Create a new session (streamer only)
export async function POST(request: NextRequest) {
  try {
    const { playerId, streamerCode } = await request.json()

    // Verify streamer code
    if (streamerCode !== "MRASH") {
      return NextResponse.json({ error: "Invalid streamer code" }, { status: 403 })
    }

    // Get player details
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Deactivate any existing active sessions
    await prisma.curatedSession.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    // Get clan logo if player has a clan
    let clanLogo = null
    if (player.clan) {
      const clan = await prisma.clan.findFirst({
        where: {
          OR: [
            { shortName: player.clan },
            { name: player.clan }
          ]
        },
        select: { logo: true }
      })
      clanLogo = clan?.logo || null
    }

    // Create new session
    const session = await prisma.curatedSession.create({
      data: {
        playerId: player.id,
        playerName: player.name,
        category: player.category,
        nationality: player.nationality,
        clan: player.clan,
        isActive: true,
      },
      include: {
        ratings: true
      }
    })

    return NextResponse.json({
      ...session,
      avatar: player.avatar,
      clanLogo
    })
  } catch (error) {
    console.error("Error creating curated session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

// DELETE - End current session without confirming
export async function DELETE(request: NextRequest) {
  try {
    const { streamerCode } = await request.json()

    if (streamerCode !== "MRASH") {
      return NextResponse.json({ error: "Invalid streamer code" }, { status: 403 })
    }

    await prisma.curatedSession.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ending curated session:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}

