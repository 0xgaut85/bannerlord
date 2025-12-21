import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { discordName: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ]
      } : {},
      select: {
        id: true,
        name: true,
        discordName: true,
        division: true,
        team: true,
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

