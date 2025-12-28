import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const streamerCode = process.env.CURATED_STREAMER_CODE
    const raterCode = process.env.CURATED_RATER_CODE

    if (code === streamerCode) {
      return NextResponse.json({ 
        success: true, 
        isStreamer: true 
      })
    } else if (code === raterCode) {
      return NextResponse.json({ 
        success: true, 
        isStreamer: false 
      })
    } else {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 })
    }
  } catch (error) {
    console.error("Curated auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

