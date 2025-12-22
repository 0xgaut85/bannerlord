import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// POST - Ban a user and delete all their ratings
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { reason } = body

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, discordName: true, name: true, isBanned: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "User is already banned" }, { status: 400 })
    }

    // Ban the user and delete all their ratings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all ratings from this user
      const deletedRatings = await tx.rating.deleteMany({
        where: { raterId: userId }
      })

      // Ban the user
      const bannedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: reason || "Violation of community guidelines",
          bannedAt: new Date()
        }
      })

      return { deletedRatings: deletedRatings.count, user: bannedUser }
    })

    return NextResponse.json({
      success: true,
      message: `User ${user.discordName || user.name} has been banned. ${result.deletedRatings} ratings deleted.`,
      deletedRatings: result.deletedRatings
    })
  } catch (error) {
    console.error("Error banning user:", error)
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
  }
}

// DELETE - Unban a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, discordName: true, name: true, isBanned: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.isBanned) {
      return NextResponse.json({ error: "User is not banned" }, { status: 400 })
    }

    // Unban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: `User ${user.discordName || user.name} has been unbanned.`
    })
  } catch (error) {
    console.error("Error unbanning user:", error)
    return NextResponse.json({ error: "Failed to unban user" }, { status: 500 })
  }
}

