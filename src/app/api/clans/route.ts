import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { shortName: { contains: search, mode: "insensitive" as const } },
      ]
    } : {}
    
    const clans = await prisma.clan.findMany({
      where,
      orderBy: { name: "asc" },
    })
    
    return NextResponse.json(clans)
  } catch (error) {
    console.error("Clans GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, shortName, logo } = body
    
    if (!name || !shortName) {
      return NextResponse.json({ error: "Name and short name are required" }, { status: 400 })
    }
    
    // Check if clan already exists
    const existing = await prisma.clan.findFirst({
      where: {
        OR: [
          { name },
          { shortName }
        ]
      }
    })
    
    if (existing) {
      return NextResponse.json({ error: "A clan with this name or short name already exists" }, { status: 400 })
    }
    
    const clan = await prisma.clan.create({
      data: {
        name,
        shortName: shortName.toUpperCase(),
        logo: logo || null,
      }
    })
    
    return NextResponse.json(clan)
  } catch (error) {
    console.error("Clans POST error:", error)
    return NextResponse.json({ error: "Failed to create clan" }, { status: 500 })
  }
}

