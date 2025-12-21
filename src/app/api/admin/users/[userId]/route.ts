import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user with their ratings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ratings: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                category: true,
                nationality: true,
                clan: true,
              }
            }
          },
          orderBy: {
            updatedAt: "desc"
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user ratings:", error)
    return NextResponse.json({ error: "Failed to fetch user ratings" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Delete all ratings for this user
    await prisma.rating.deleteMany({
      where: { raterId: userId }
    })

    return NextResponse.json({ message: "All ratings deleted successfully" })
  } catch (error) {
    console.error("Error deleting user ratings:", error)
    return NextResponse.json({ error: "Failed to delete user ratings" }, { status: 500 })
  }
}


