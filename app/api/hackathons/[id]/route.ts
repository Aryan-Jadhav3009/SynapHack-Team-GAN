import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET /api/hackathons/[id] - Get hackathon by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    return NextResponse.json(hackathon)
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/hackathons/[id] - Update hackathon
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    if (hackathon.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
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

    return NextResponse.json(updatedHackathon)
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
