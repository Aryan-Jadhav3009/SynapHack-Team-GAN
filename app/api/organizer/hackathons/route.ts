import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Access denied. Organizer role required." }, { status: 403 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock data for organizer hackathons
      const mockHackathons = [
        {
          id: "hack-1",
          title: "AI Innovation Challenge 2024",
          description: "Build the next generation of AI-powered applications",
          status: "REGISTRATION_OPEN",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            participations: 45,
            teams: 12,
            submissions: 8,
          },
        },
        {
          id: "hack-2",
          title: "Web3 Builders Hackathon",
          description: "Create decentralized applications for the future",
          status: "IN_PROGRESS",
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            participations: 67,
            teams: 18,
            submissions: 15,
          },
        },
        {
          id: "hack-3",
          title: "Sustainability Tech Challenge",
          description: "Develop solutions for environmental challenges",
          status: "COMPLETED",
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            participations: 89,
            teams: 25,
            submissions: 22,
          },
        },
      ]

      return NextResponse.json({ hackathons: mockHackathons })
    }

    const hackathons = await prisma.hackathon.findMany({
      where: {
        organizerId: user.id,
      },
      include: {
        _count: {
          select: {
            participations: true,
            teams: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ hackathons })
  } catch (error) {
    console.error("Error fetching organizer hackathons:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
