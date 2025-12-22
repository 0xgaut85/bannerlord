import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const requests = await prisma.editRequest.findMany({
      where: status ? { status: status as any } : {},
      include: {
        player: {
          select: { name: true, nationality: true, clan: true }
        },
        user: {
          select: { name: true, discordName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}



