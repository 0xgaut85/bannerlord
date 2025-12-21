import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const resolvedParams = await params
    const ratingId = resolvedParams.ratingId
    
    console.log(`[DELETE] Attempting to delete rating: ${ratingId}`)
    
    // First check if the rating exists
    const existingRating = await prisma.rating.findUnique({
      where: { id: ratingId }
    })
    
    if (!existingRating) {
      console.log(`[DELETE] Rating ${ratingId} not found (already deleted)`)
      // Return success if already deleted
      const response = NextResponse.json({ success: true, deletedId: ratingId, alreadyDeleted: true })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      return response
    }
    
    // Delete the rating
    const deleted = await prisma.rating.delete({
      where: { id: ratingId }
    })
    
    console.log(`[DELETE] Successfully deleted rating: ${ratingId}`)
    
    // Verify deletion
    const stillExists = await prisma.rating.findUnique({
      where: { id: ratingId }
    })
    
    if (stillExists) {
      console.error(`[DELETE] Rating ${ratingId} still exists after deletion!`)
      return NextResponse.json({ error: "Deletion failed - rating still exists" }, { status: 500 })
    }
    
    // Return with no-cache headers
    const response = NextResponse.json({ 
      success: true, 
      deletedId: ratingId,
      verified: true
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    return response
  } catch (error: any) {
    console.error("Rating delete error:", error)
    // If it's a "not found" error, treat as success (already deleted)
    if (error?.code === 'P2025') {
      const response = NextResponse.json({ success: true, deletedId: "unknown", alreadyDeleted: true })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }
    return NextResponse.json({ error: "Failed to delete rating", details: error?.message }, { status: 500 })
  }
}


