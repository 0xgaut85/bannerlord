import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    })
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "settings",
          currentPeriodEnd: null,
          currentPeriodName: null,
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
    const { currentPeriodEnd, currentPeriodName, adminUsername, adminPassword } = body

    const envUser = process.env.ADMIN_USERNAME
    const envPass = process.env.ADMIN_PASSWORD
    if (!envUser || !envPass || adminUsername !== envUser || adminPassword !== envPass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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


