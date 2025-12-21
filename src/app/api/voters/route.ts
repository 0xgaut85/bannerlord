import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { MIN_RATINGS } from "@/lib/utils"

export const dynamic = 'force-dynamic'

// Get all eligible voters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    // If userId provided, get that user's ratings
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          discordName: true,
          division: true,
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
            orderBy: { score: "desc" }
          }
        }
      })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      return NextResponse.json(user)
    }
    
    // Get all users who have made at least one rating
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          discordId: { startsWith: "system_" }
        },
        ratings: {
          some: {} // Has at least one rating
        }
      },
      select: {
        id: true,
        name: true,
        discordName: true,
        division: true,
        ratings: {
          select: {
            player: {
              select: { category: true }
            }
          }
        }
      },
      orderBy: {
        ratings: { _count: "desc" }
      }
    })
    
    // Map users with eligibility status
    const allVoters = users.map(user => {
      const infantryCount = user.ratings.filter(r => r.player.category === "INFANTRY").length
      const cavalryCount = user.ratings.filter(r => r.player.category === "CAVALRY").length
      const archerCount = user.ratings.filter(r => r.player.category === "ARCHER").length
      
      const isEligible = (
        infantryCount >= MIN_RATINGS.INFANTRY &&
        cavalryCount >= MIN_RATINGS.CAVALRY &&
        archerCount >= MIN_RATINGS.ARCHER
      )
      
      return {
        id: user.id,
        name: user.name || "Anonymous",
        discordName: user.discordName,
        division: user.division,
        totalRatings: user.ratings.length,
        infantryCount,
        cavalryCount,
        archerCount,
        isEligible,
      }
    })
    
    return NextResponse.json(allVoters)
  } catch (error) {
    console.error("Voters GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

