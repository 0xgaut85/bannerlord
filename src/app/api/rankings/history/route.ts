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
      // First get legend player IDs to exclude them
      const legendPlayerIds = await prisma.player.findMany({
        where: { isLegend: true },
        select: { id: true }
      })
      const legendIds = legendPlayerIds.map(p => p.id)
      
      const period = await prisma.rankingPeriod.findUnique({
        where: { id: periodId },
        include: {
          rankings: {
            where: {
              ...(category ? { category: category as any } : {}),
              playerId: { notIn: legendIds }  // Exclude legends
            },
            orderBy: { rank: "asc" }
          }
        }
      })
      
      if (!period) {
        return NextResponse.json({ error: "Period not found" }, { status: 404 })
      }
      
      return NextResponse.json(period)
    }
    
    // Get legend player IDs to exclude from count
    const legendPlayerIds = await prisma.player.findMany({
      where: { isLegend: true },
      select: { id: true }
    })
    const legendIds = legendPlayerIds.map(p => p.id)
    
    // Otherwise, get all periods (without full rankings)
    const periods = await prisma.rankingPeriod.findMany({
      orderBy: { endDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        rankings: {
          where: { playerId: { notIn: legendIds } },
          select: { id: true }
        }
      }
    })
    
    // Transform to include count
    const result = periods.map(p => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      _count: { rankings: p.rankings.length }
    }))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("History GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


