import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { periodName, adminUsername, adminPassword } = body

    const envUser = process.env.ADMIN_USERNAME
    const envPass = process.env.ADMIN_PASSWORD
    if (!envUser || !envPass || adminUsername !== envUser || adminPassword !== envPass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!periodName) {
      return NextResponse.json({ error: "periodName required" }, { status: 400 })
    }

    const period = await prisma.rankingPeriod.findUnique({ where: { name: periodName } })
    if (!period) {
      return NextResponse.json({ error: `Period "${periodName}" not found` }, { status: 404 })
    }

    // Cascade deletes HistoricalRanking and HistoricalRating automatically
    await prisma.rankingPeriod.delete({ where: { id: period.id } })

    const remaining = await prisma.rankingPeriod.findMany({
      select: { name: true },
      orderBy: { startDate: "asc" }
    })

    return NextResponse.json({
      success: true,
      deleted: periodName,
      remaining: remaining.map(p => p.name),
    })
  } catch (error) {
    console.error("Delete period error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
