import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Fix existing player names that have "(Legend)" suffix to "(L)"
export async function POST() {
  try {
    // Find all players with "(Legend)" in their name
    const players = await prisma.player.findMany({
      where: {
        name: {
          contains: "(Legend)",
        },
      },
    })

    const results: { name: string; newName: string; status: string }[] = []

    for (const player of players) {
      try {
        const newName = player.name.replace(/ \(Legend\)/g, ' (L)')
        
        await prisma.player.update({
          where: { id: player.id },
          data: { name: newName },
        })

        results.push({
          name: player.name,
          newName,
          status: "updated",
        })
      } catch (error) {
        console.error(`Error updating ${player.name}:`, error)
        results.push({
          name: player.name,
          newName: player.name,
          status: "error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.filter(r => r.status === "updated").length} player names`,
      results,
    })
  } catch (error) {
    console.error("Fix legend names error:", error)
    return NextResponse.json({ error: "Failed to fix legend names" }, { status: 500 })
  }
}


