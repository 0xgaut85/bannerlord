import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PlayerCategory, Division } from "@prisma/client"
import { DIVISION_DEFAULT_RATINGS, getDivisionFromRating } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as PlayerCategory | null
    const search = searchParams.get("search")
    
    const where: {
      category?: PlayerCategory
      name?: { contains: string; mode: "insensitive" }
    } = {}
    
    if (category && Object.values(PlayerCategory).includes(category)) {
      where.category = category
    }
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }
    
    const players = await prisma.player.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        ratings: {
          select: { score: true }
        }
      }
    })
    
    // Get all unique clan names and fetch their logos
    const clanNames = [...new Set(players.map(p => p.clan).filter(Boolean))] as string[]
    
    // Fetch clan logos from Clan table
    const clans = await prisma.clan.findMany({
      where: {
        shortName: { in: clanNames }
      },
      select: {
        shortName: true,
        logo: true,
      }
    })
    
    // Create a map of clan shortName to logo
    const clanLogos: Record<string, string | null> = {}
    clans.forEach(c => {
      clanLogos[c.shortName] = c.logo
    })
    
    // Add clanLogo and calculated division to each player
    const playersWithExtras = players.map(player => {
      // Calculate average rating if has ratings, otherwise use division default
      let avgRating = 70 // default
      if (player.ratings.length > 0) {
        avgRating = player.ratings.reduce((sum, r) => sum + r.score, 0) / player.ratings.length
      } else if (player.division) {
        avgRating = DIVISION_DEFAULT_RATINGS[player.division]
      }
      
      // Calculate division from rating if not set
      const calculatedDivision = player.division || getDivisionFromRating(avgRating)
      
      return {
        id: player.id,
        name: player.name,
        category: player.category,
        nationality: player.nationality,
        clan: player.clan,
        bio: player.bio,
        avatar: player.avatar,
        division: calculatedDivision,
        clanLogo: player.clan ? clanLogos[player.clan] || null : null,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: player.ratings.length,
      }
    })
    
    return NextResponse.json(playersWithExtras)
  } catch (error) {
    console.error("Players GET error:", error)
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
    const { name, category, nationality, clan, bio, division, avatar } = body
    
    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }
    
    if (!Object.values(PlayerCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    
    // Check if player already exists
    const existing = await prisma.player.findUnique({
      where: { name }
    })
    
    if (existing) {
      return NextResponse.json({ error: "A player with this name already exists" }, { status: 400 })
    }
    
    // Create the player
    const player = await prisma.player.create({
      data: {
        name,
        category,
        nationality: nationality || null,
        clan: clan || null,
        bio: bio?.slice(0, 240) || null,
        division: division || null,
        avatar: avatar || null,
      }
    })
    
    // If division is provided, create default ratings from system raters
    if (division && Object.values(Division).includes(division)) {
      const defaultRating = DIVISION_DEFAULT_RATINGS[division as Division]
      
      // Get system raters
      const systemRaters = await prisma.user.findMany({
        where: {
          discordId: { startsWith: "system_" }
        },
        take: 5
      })
      
      // Create ratings from system raters
      if (systemRaters.length >= 5) {
        const scores = [defaultRating, defaultRating, defaultRating + 1, defaultRating - 1, defaultRating]
        
        for (let i = 0; i < 5; i++) {
          await prisma.rating.create({
            data: {
              raterId: systemRaters[i].id,
              playerId: player.id,
              score: scores[i],
            }
          })
        }
      }
    }
    
    return NextResponse.json(player)
  } catch (error) {
    console.error("Players POST error:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
