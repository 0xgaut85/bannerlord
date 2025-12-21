import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const resolvedParams = await params
    const ratingId = resolvedParams.ratingId
    
    // First check if the rating exists
    const existingRating = await prisma.rating.findUnique({
      where: { id: ratingId }
    })
    
    if (!existingRating) {
      return NextResponse.json({ error: "Rating not found", deleted: true }, { status: 404 })
    }
    
    // Delete the rating
    await prisma.rating.delete({
      where: { id: ratingId }
    })
    
    // Return with no-cache headers
    const response = NextResponse.json({ success: true, deletedId: ratingId })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error("Rating delete error:", error)
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
}


