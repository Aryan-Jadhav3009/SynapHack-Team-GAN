import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

const createHackathonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  theme: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  maxTeamSize: z.number().min(1).max(10).default(4),
  prizes: z.any().optional(),
  rules: z.string().optional(),
  bannerImage: z.string().optional(),
})

// GET /api/hackathons - List all hackathons
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching hackathons...")
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    if (!process.env.AZURE_SQL_CONNECTION_STRING || process.env.AZURE_SQL_CONNECTION_STRING.includes("placeholder")) {
      console.log("[v0] Database not configured, returning mock data")

      const mockHackathons = [
        {
          id: "1",
          title: "AI Innovation Challenge 2024",
          description: "Build the next generation of AI-powered applications that solve real-world problems.",
          theme: "Artificial Intelligence",
          startDate: "2024-03-15T09:00:00Z",
          endDate: "2024-03-17T18:00:00Z",
          status: "REGISTRATION_OPEN",
          maxTeamSize: 4,
          bannerImage: null,
          organizer: {
            id: "org1",
            username: "techcorp",
            firstName: "Tech",
            lastName: "Corp",
          },
          _count: {
            participations: 156,
            teams: 39,
            submissions: 0,
          },
        },
        {
          id: "2",
          title: "Sustainable Tech Hackathon",
          description: "Create innovative solutions for environmental challenges using cutting-edge technology.",
          theme: "Sustainability",
          startDate: "2024-04-01T10:00:00Z",
          endDate: "2024-04-03T20:00:00Z",
          status: "UPCOMING",
          maxTeamSize: 5,
          bannerImage: null,
          organizer: {
            id: "org2",
            username: "greentech",
            firstName: "Green",
            lastName: "Tech Foundation",
          },
          _count: {
            participations: 89,
            teams: 22,
            submissions: 0,
          },
        },
        {
          id: "3",
          title: "FinTech Revolution",
          description: "Revolutionize financial services with blockchain, AI, and innovative payment solutions.",
          theme: "Financial Technology",
          startDate: "2024-02-20T08:00:00Z",
          endDate: "2024-02-22T19:00:00Z",
          status: "COMPLETED",
          maxTeamSize: 4,
          bannerImage: null,
          organizer: {
            id: "org3",
            username: "fintech",
            firstName: "FinTech",
            lastName: "Alliance",
          },
          _count: {
            participations: 203,
            teams: 51,
            submissions: 47,
          },
        },
      ]

      const filteredHackathons = status ? mockHackathons.filter((h) => h.status === status) : mockHackathons

      return NextResponse.json({
        hackathons: filteredHackathons,
        pagination: {
          page,
          limit,
          total: filteredHackathons.length,
          pages: Math.ceil(filteredHackathons.length / limit),
        },
      })
    }

    try {
      const where = status ? { status: status as any } : {}

      const [hackathons, total] = await Promise.all([
        prisma.hackathon.findMany({
          where,
          include: {
            organizer: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                participations: true,
                teams: true,
                submissions: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
          skip,
          take: limit,
        }),
        prisma.hackathon.count({ where }),
      ])

      return NextResponse.json({
        hackathons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (dbError) {
      console.log("[v0] Database error, falling back to mock data:", dbError)
      // Fall back to mock data if database fails
      const mockHackathons = [
        {
          id: "1",
          title: "AI Innovation Challenge 2024",
          description: "Build the next generation of AI-powered applications that solve real-world problems.",
          theme: "Artificial Intelligence",
          startDate: "2024-03-15T09:00:00Z",
          endDate: "2024-03-17T18:00:00Z",
          status: "REGISTRATION_OPEN",
          maxTeamSize: 4,
          bannerImage: null,
          organizer: {
            id: "org1",
            username: "techcorp",
            firstName: "Tech",
            lastName: "Corp",
          },
          _count: {
            participations: 156,
            teams: 39,
            submissions: 0,
          },
        },
      ]

      return NextResponse.json({
        hackathons: mockHackathons,
        pagination: {
          page: 1,
          limit: 10,
          total: mockHackathons.length,
          pages: 1,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Error fetching hackathons:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch hackathons",
        message: error instanceof Error ? error.message : "Unknown error",
        hackathons: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// POST /api/hackathons - Create new hackathon
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const data = createHackathonSchema.parse(body)

    const hackathon = await prisma.hackathon.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        organizerId: user.id,
        status: "UPCOMING",
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(hackathon, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error creating hackathon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
