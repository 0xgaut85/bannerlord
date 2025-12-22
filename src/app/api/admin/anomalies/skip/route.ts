import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ratingId } = body

    if (!ratingId || typeof ratingId !== "string") {
      return NextResponse.json(
        { error: "ratingId is required" },
        { status: 400 }
      )
    }

    // Get or create SiteSettings
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" },
    })

    if (!settings) {
      await prisma.siteSettings.create({
        data: {
          id: "settings",
          skippedAnomalies: [ratingId],
        },
      })
    } else {
      // Add ratingId to skippedAnomalies if not already present
      if (!settings.skippedAnomalies.includes(ratingId)) {
        await prisma.siteSettings.update({
          where: { id: "settings" },
          data: {
            skippedAnomalies: [...settings.skippedAnomalies, ratingId],
          },
        })
      }
    }

    return NextResponse.json({ success: true, message: "Anomaly marked as safe" })
  } catch (error) {
    console.error("Error skipping anomaly:", error)
    return NextResponse.json(
      { error: "Failed to skip anomaly" },
      { status: 500 }
    )
  }
}

