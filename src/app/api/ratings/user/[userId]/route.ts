import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { MIN_RATINGS } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        discordName: true,
        team: true,
        division: true,
        image: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Get user's ratings
    const ratings = await prisma.rating.findMany({
      where: { raterId: userId },
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
      orderBy: [
        { player: { category: "asc" } },
        { score: "desc" }
      ]
    })
    
    // Calculate eligibility
    const infantryCount = ratings.filter(r => r.player.category === "INFANTRY").length
    const cavalryCount = ratings.filter(r => r.player.category === "CAVALRY").length
    const archerCount = ratings.filter(r => r.player.category === "ARCHER").length
    
    const isEligible = 
      infantryCount >= MIN_RATINGS.INFANTRY &&
      cavalryCount >= MIN_RATINGS.CAVALRY &&
      archerCount >= MIN_RATINGS.ARCHER
    
    return NextResponse.json({
      user,
      ratings,
      eligibility: {
        isEligible,
        infantry: { current: infantryCount, required: MIN_RATINGS.INFANTRY },
        cavalry: { current: cavalryCount, required: MIN_RATINGS.CAVALRY },
        archer: { current: archerCount, required: MIN_RATINGS.ARCHER },
      }
    })
  } catch (error) {
    console.error("User ratings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





