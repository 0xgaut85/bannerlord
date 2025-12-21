import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canUserEdit } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const ratings = await prisma.rating.findMany({
      where: { raterId: session.user.id },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            category: true,
            nationality: true,
          }
        }
      },
      orderBy: { player: { name: "asc" } }
    })
    
    return NextResponse.json(ratings)
  } catch (error) {
    console.error("Ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if profile is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProfileComplete: true, lastEditAt: true, division: true }
    })
    
    if (!user?.isProfileComplete) {
      return NextResponse.json({ 
        error: "Please complete your profile (set team and division) before rating" 
      }, { status: 403 })
    }
    
    // Check 24h cooldown
    if (!canUserEdit(user.lastEditAt)) {
      return NextResponse.json({ 
        error: "You can only edit your ratings once every 24 hours" 
      }, { status: 429 })
    }
    
    const body = await request.json()
    const { ratings } = body as { ratings: { playerId: string; score: number }[] }
    
    if (!Array.isArray(ratings)) {
      return NextResponse.json({ error: "Invalid ratings format" }, { status: 400 })
    }
    
    // Validate scores (50-99)
    for (const rating of ratings) {
      if (rating.score < 50 || rating.score > 99) {
        return NextResponse.json({ 
          error: "Scores must be between 50 and 99" 
        }, { status: 400 })
      }
    }
    
    // Upsert all ratings in a transaction
    await prisma.$transaction(async (tx) => {
      for (const rating of ratings) {
        await tx.rating.upsert({
          where: {
            raterId_playerId: {
              raterId: session.user.id,
              playerId: rating.playerId,
            }
          },
          create: {
            raterId: session.user.id,
            playerId: rating.playerId,
            score: rating.score,
          },
          update: {
            score: rating.score,
          }
        })
      }
      
      // Update lastEditAt
      await tx.user.update({
        where: { id: session.user.id },
        data: { lastEditAt: new Date() }
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ratings POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


