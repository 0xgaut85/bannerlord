import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PlayerCategory } from "@prisma/client"

export const dynamic = 'force-dynamic'

// Check legend status - auto-seed if none exist
export async function GET() {
  try {
    const legendCount = await prisma.player.count({
      where: { isLegend: true }
    })
    
    // Auto-seed if no legends exist
    if (legendCount === 0) {
      const results: { name: string; status: string }[] = []

      for (const legend of legends) {
        try {
          const existing = await prisma.player.findUnique({
            where: { name: legend.name }
          })

          if (existing) {
            await prisma.player.update({
              where: { name: legend.name },
              data: { 
                isLegend: true,
                nationality: legend.nationality, // Update nationality too
              }
            })
            results.push({ name: legend.name, status: "updated" })
          } else {
            await prisma.player.create({
              data: {
                name: legend.name,
                category: legend.category as PlayerCategory,
                nationality: legend.nationality,
                isLegend: true,
              }
            })
            results.push({ name: legend.name, status: "created" })
          }
        } catch (error) {
          console.error(`Error with ${legend.name}:`, error)
          results.push({ name: legend.name, status: "error" })
        }
      }

      return NextResponse.json({ 
        message: "Auto-seeded legends!",
        count: results.filter(r => r.status !== "error").length,
        results
      })
    }
    
    const legendsList = await prisma.player.findMany({
      where: { isLegend: true },
      select: { name: true, category: true, nationality: true }
    })
    
    return NextResponse.json({ 
      count: legendCount, 
      legends: legendsList,
      message: "Legends exist."
    })
  } catch (error) {
    console.error("Check legends error:", error)
    return NextResponse.json({ error: "Failed to check legends" }, { status: 500 })
  }
}

// Map nationality names to ISO country codes for flags
const nationalityMap: Record<string, string> = {
  france: "fr",
  french: "fr",
  francais: "fr",
  poland: "pl",
  german: "de",
  germany: "de",
  russian: "ru",
  russia: "ru",
  italy: "it",
  belgium: "be",
  turk: "tr",
  turkey: "tr",
  ukraine: "ua",
  scotland: "gb",
  england: "gb",
  swiss: "ch",
  switzerland: "ch",
  czech: "cz",
  latvia: "lv",
}

// Legend players data (names with proper capitalization, nationality as ISO codes)
const legends = [
  { name: "CTH", category: "INFANTRY", nationality: "fr" },
  { name: "SharZ", category: "INFANTRY", nationality: "fr" },
  { name: "Woj", category: "CAVALRY", nationality: "pl" },
  { name: "Orpsel", category: "CAVALRY", nationality: "pl" },
  { name: "Bard", category: "INFANTRY", nationality: "de" },
  { name: "Dextrus", category: "INFANTRY", nationality: "de" },
  { name: "Lars", category: "CAVALRY", nationality: "de" },
  { name: "Roman", category: "CAVALRY", nationality: "de" },
  { name: "Axder", category: "INFANTRY", nationality: "pl" },
  { name: "Pacemaker", category: "INFANTRY", nationality: "pl" },
  { name: "Apriko", category: "INFANTRY", nationality: "de" },
  { name: "Ghazi", category: "CAVALRY", nationality: "pl" },
  { name: "Indar", category: "CAVALRY", nationality: "ru" },
  { name: "OneClips", category: "INFANTRY", nationality: "de" },
  { name: "Scherdinger", category: "INFANTRY", nationality: "pl" },
  { name: "Cosimo", category: "INFANTRY", nationality: "it" },
  { name: "Hodor", category: "INFANTRY", nationality: "be" },
  { name: "Gobou", category: "INFANTRY", nationality: "be" },
  { name: "Aran", category: "CAVALRY", nationality: "tr" },
  { name: "Relynar", category: "CAVALRY", nationality: "ua" },
  { name: "LK_Hemsworth", category: "CAVALRY", nationality: "tr" },
  { name: "WilliamWallace", category: "INFANTRY", nationality: "gb" },
  { name: "Sarranid", category: "INFANTRY", nationality: "fr" },
  { name: "Nord", category: "CAVALRY", nationality: "ru" },
  { name: "Argentum", category: "INFANTRY", nationality: "ru" },
  { name: "Dark", category: "CAVALRY", nationality: "fr" },
  { name: "AncientLunatic", category: "CAVALRY", nationality: "gb" },
  { name: "Kazu", category: "INFANTRY", nationality: "ch" },
  { name: "HypeZ", category: "INFANTRY", nationality: "de" },
  { name: "Jufasto", category: "INFANTRY", nationality: "tr" },
  { name: "Livso", category: "CAVALRY", nationality: "cz" },
  { name: "Rangah", category: "CAVALRY", nationality: "lv" },
]

export async function POST() {
  try {
    const results: { name: string; status: string }[] = []

    for (const legend of legends) {
      try {
        // Check if player already exists
        const existing = await prisma.player.findUnique({
          where: { name: legend.name }
        })

        if (existing) {
          // Update to legend status
          await prisma.player.update({
            where: { name: legend.name },
            data: {
              isLegend: true,
              nationality: legend.nationality,
            }
          })
          results.push({ name: legend.name, status: "updated" })
        } else {
          // Create new legend player
          await prisma.player.create({
            data: {
              name: legend.name,
              category: legend.category as PlayerCategory,
              nationality: legend.nationality,
              isLegend: true,
            }
          })
          results.push({ name: legend.name, status: "created" })
        }
      } catch (error) {
        console.error(`Error with ${legend.name}:`, error)
        results.push({ name: legend.name, status: "error" })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${results.filter(r => r.status !== "error").length} legends`,
      results 
    })
  } catch (error) {
    console.error("Seed legends error:", error)
    return NextResponse.json({ error: "Failed to seed legends" }, { status: 500 })
  }
}

