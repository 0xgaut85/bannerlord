import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE - Reset all raters (delete all CuratedRating entries from active/all sessions)
export async function DELETE() {
  try {
    // Delete all curated ratings (rater entries)
    const deleted = await prisma.curatedRating.deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleted.count} rater entries` 
    })
  } catch (error) {
    console.error("Error resetting raters:", error)
    return NextResponse.json({ error: "Failed to reset raters" }, { status: 500 })
  }
}

