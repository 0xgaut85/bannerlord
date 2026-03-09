import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const { ratingId } = await params
    const { muted } = await request.json()

    const rating = await prisma.rating.update({
      where: { id: ratingId },
      data: { isMuted: !!muted },
      select: { id: true, isMuted: true },
    })

    return NextResponse.json({ success: true, id: rating.id, isMuted: rating.isMuted })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }
    console.error("Mute rating error:", error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}
