import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Base filter: exclude system users and only show users with ratings
    const baseWhere: Prisma.UserWhereInput = {
      NOT: { discordId: { startsWith: "system_" } },
      ratings: { some: {} } // Only users who have at least one rating
    }

    const whereClause: Prisma.UserWhereInput = search ? {
      ...baseWhere,
      OR: [
        { discordName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ]
    } : baseWhere

    // Get total count for pagination
    const total = await prisma.user.count({ where: whereClause })

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        discordName: true,
        division: true,
        team: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    const hasMore = skip + users.length < total

    return NextResponse.json({ users, hasMore, total })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

