import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    
    if (!query || query.length < 2) {
      return NextResponse.json([])
    }
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { discordName: { contains: query, mode: "insensitive" } },
        ]
      },
      select: {
        id: true,
        name: true,
        discordName: true,
        team: true,
        division: true,
        image: true,
        _count: {
          select: { ratings: true }
        }
      },
      take: 20,
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error("User search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}















