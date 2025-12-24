import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const shortNames = searchParams.get("shortNames")
    
    // If fetching by specific shortNames (for clan logos)
    if (shortNames) {
      const names = shortNames.split(",").filter(Boolean)
      const clans = await prisma.clan.findMany({
        where: {
          shortName: { in: names }
        },
        select: {
          shortName: true,
          logo: true,
          name: true,
        }
      })
      return NextResponse.json(clans)
    }
    
    // First try the Clan table
    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { shortName: { contains: search, mode: "insensitive" as const } },
      ]
    } : {}
    
    const clansFromTable = await prisma.clan.findMany({
      where,
      orderBy: { name: "asc" },
    })
    
    // Also get unique clans from Player table (in case Clan table is empty)
    const playersWithClans = await prisma.player.findMany({
      where: search ? {
        clan: { contains: search, mode: "insensitive" as const }
      } : {
        clan: { not: null }
      },
      select: { clan: true },
      distinct: ["clan"],
    })
    
    // Merge results - prefer Clan table entries
    const clanTableNames = clansFromTable.map(c => c.shortName.toUpperCase())
    
    // Add player clans that aren't in the Clan table
    const uniquePlayerClans = playersWithClans
      .filter(p => p.clan && !clanTableNames.includes(p.clan.toUpperCase()))
      .map(p => ({
        id: `player-clan-${p.clan}`,
        name: p.clan,
        shortName: p.clan!,
        logo: null,
      }))
    
    const allClans = [...clansFromTable, ...uniquePlayerClans]
    
    return NextResponse.json(allClans)
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
