import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken } from "@/lib/auth"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PARTICIPANT", "ORGANIZER"]).default("PARTICIPANT"), // Added role validation
})

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { email, username, firstName, lastName, password, role } = registerSchema.parse(body) // Added role destructuring

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email ? "Email already registered" : "Username already taken" },
        { status: 400 },
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        role, // Added role to user creation
        // Note: In a real implementation, you'd store the hashed password
        // For this demo, we're not storing passwords in the schema
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    const response = NextResponse.json({
      user,
      token,
      message: "Registration successful",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
