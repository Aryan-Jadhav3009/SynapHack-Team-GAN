import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { verifyToken } from "@/lib/auth"

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  skills: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
})

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const profileData = profileSchema.parse(body)

    // Mock update since we don't have real database
    return NextResponse.json({
      message: "Profile updated successfully",
      profile: profileData,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Mock profile data
    return NextResponse.json({
      bio: "Passionate developer and hackathon enthusiast",
      linkedin: "",
      github: "",
      website: "",
      skills: "React, Node.js, TypeScript",
      profileImage: "",
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
