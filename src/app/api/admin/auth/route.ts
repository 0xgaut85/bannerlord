import { NextRequest, NextResponse } from "next/server"

// POST - Verify admin credentials
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const adminUser = process.env.ADMIN_USERNAME
    const adminPass = process.env.ADMIN_PASSWORD

    if (!adminUser || !adminPass) {
      console.error("Admin credentials not configured in environment")
      return NextResponse.json({ success: false }, { status: 500 })
    }

    if (username === adminUser && password === adminPass) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

