import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get curated ranking periods or a specific period's rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodId = searchParams.get("periodId")

    if (periodId) {
      // Fetch specific period with rankings
      const period = await prisma.curatedRankingPeriod.findUnique({
        where: { id: periodId },
        include: {
          rankings: {
            orderBy: { rank: "asc" }
          }
        }
      })

      if (!period) {
        return NextResponse.json({ error: "Period not found" }, { status: 404 })
      }

      return NextResponse.json(period)
    }

    // Fetch all periods
    const periods = await prisma.curatedRankingPeriod.findMany({
      orderBy: { savedAt: "desc" },
      include: {
        _count: {
          select: { rankings: true }
        }
      }
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error("Error fetching curated history:", error)
    return NextResponse.json({ error: "Failed to fetch curated history" }, { status: 500 })
  }
}

