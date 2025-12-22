import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    })
    
    // Create default settings if not exists
    if (!settings) {
      // Set default: 48 hours from now, December 2025
      const endDate = new Date()
      endDate.setHours(endDate.getHours() + 48)
      
      settings = await prisma.siteSettings.create({
        data: {
          id: "settings",
          currentPeriodEnd: endDate,
          currentPeriodName: "December 2025"
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPeriodEnd, currentPeriodName } = body
    
    const settings = await prisma.siteSettings.upsert({
      where: { id: "settings" },
      create: {
        id: "settings",
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
        currentPeriodName
      },
      update: {
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
        currentPeriodName
      }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


