import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/registrations - Get all user registrations for admin view
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Admin or organizer access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}

    if (hackathonId) {
      where.hackathonId = hackathonId
    }

    // If organizer, only show their hackathons
    if (user.role === "ORGANIZER") {
      where.hackathon = {
        organizerId: user.id,
      }
    }

    const [registrations, total] = await Promise.all([
      prisma.participation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true,
              skills: true,
              avatar: true,
              createdAt: true,
            },
          },
          hackathon: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.participation.count({ where }),
    ])

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
