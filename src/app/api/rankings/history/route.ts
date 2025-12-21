import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Get all historical ranking periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodId = searchParams.get("periodId")
    const category = searchParams.get("category")
    
    // If periodId provided, get rankings for that period
    if (periodId) {
      const period = await prisma.rankingPeriod.findUnique({
        where: { id: periodId },
        include: {
          rankings: {
            where: category ? { category: category as any } : undefined,
            orderBy: { rank: "asc" }
          }
        }
      })
      
      if (!period) {
        return NextResponse.json({ error: "Period not found" }, { status: 404 })
      }
      
      return NextResponse.json(period)
    }
    
    // Otherwise, get all periods (without full rankings)
    const periods = await prisma.rankingPeriod.findMany({
      orderBy: { endDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        _count: { select: { rankings: true } }
      }
    })
    
    return NextResponse.json(periods)
  } catch (error) {
    console.error("History GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

