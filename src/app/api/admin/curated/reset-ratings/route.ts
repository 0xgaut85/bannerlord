import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE - Reset all curated ratings (delete all CuratedRanking entries)
export async function DELETE() {
  try {
    // Delete all curated rankings
    const deleted = await prisma.curatedRanking.deleteMany({})
    
    // Also delete all sessions and their ratings
    await prisma.curatedSession.deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleted.count} curated rankings and all sessions` 
    })
  } catch (error) {
    console.error("Error resetting curated ratings:", error)
    return NextResponse.json({ error: "Failed to reset curated ratings" }, { status: 500 })
  }
}

