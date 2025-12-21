import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null // "avatar" or "clan-logo"
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    
    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG and JPEG images are allowed" }, { status: 400 })
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 })
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const ext = file.type === "image/png" ? "png" : "jpg"
    const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    
    // Save to public/uploads folder
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filepath = join(uploadDir, filename)
    
    try {
      await writeFile(filepath, buffer)
    } catch (err) {
      // If public/uploads doesn't exist, create it
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filepath, buffer)
    }
    
    const url = `/uploads/${filename}`
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

