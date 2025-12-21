import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const resolvedParams = await params
    
    await prisma.rating.delete({
      where: { id: resolvedParams.ratingId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Rating delete error:", error)
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
}


