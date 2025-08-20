import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock stats when database is not available
      const mockStats = {
        activeHackathons: 3,
        teamsJoined: 2,
        submissions: 1,
        rank: 42,
      }

      return NextResponse.json({ stats: mockStats })
    }

    // Get user's active hackathon participations
    const activeParticipations = await prisma.participation.count({
      where: {
        userId: user.id,
        hackathon: {
          status: {
            in: ["REGISTRATION_OPEN", "IN_PROGRESS", "JUDGING"],
          },
        },
      },
    })

    // Get user's team memberships
    const teamMemberships = await prisma.teamMember.count({
      where: {
        userId: user.id,
        status: "ACCEPTED",
      },
    })

    // Get user's submissions
    const submissions = await prisma.submission.count({
      where: {
        submitterId: user.id,
      },
    })

    // Calculate user rank (simplified - based on submissions and participations)
    const allUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            submissions: true,
            participations: true,
          },
        },
      },
    })

    const userScore = submissions * 10 + activeParticipations * 5
    const sortedUsers = allUsers
      .map((u) => ({
        id: u.id,
        score: u._count.submissions * 10 + u._count.participations * 5,
      }))
      .sort((a, b) => b.score - a.score)

    const userRank = sortedUsers.findIndex((u) => u.id === user.id) + 1

    const stats = {
      activeHackathons: activeParticipations,
      teamsJoined: teamMemberships,
      submissions,
      rank: userRank || null,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
