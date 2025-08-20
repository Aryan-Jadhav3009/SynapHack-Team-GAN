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
      // Mock stats for organizer
      const mockStats = {
        totalHackathons: 3,
        activeHackathons: 1,
        totalParticipants: 201,
        totalTeams: 55,
        totalSubmissions: 45,
      }

      return NextResponse.json({ stats: mockStats })
    }

    // Get organizer's hackathons
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
    })

    const stats = {
      totalHackathons: hackathons.length,
      activeHackathons: hackathons.filter((h) => h.status === "IN_PROGRESS" || h.status === "REGISTRATION_OPEN").length,
      totalParticipants: hackathons.reduce((sum, h) => sum + h._count.participations, 0),
      totalTeams: hackathons.reduce((sum, h) => sum + h._count.teams, 0),
      totalSubmissions: hackathons.reduce((sum, h) => sum + h._count.submissions, 0),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching organizer stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
