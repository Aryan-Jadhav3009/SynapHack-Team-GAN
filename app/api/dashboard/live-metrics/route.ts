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
      // Mock live metrics when database is not available
      const mockMetrics = {
        onlineUsers: Math.floor(Math.random() * 50) + 20,
        activeTeams: Math.floor(Math.random() * 15) + 5,
        recentSubmissions: Math.floor(Math.random() * 8) + 2,
        liveEvents: Math.floor(Math.random() * 3) + 1,
        lastUpdated: new Date().toISOString(),
      }

      return NextResponse.json({ metrics: mockMetrics })
    }

    // Get current timestamp for "recent" calculations (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Calculate live metrics
    const [recentActiveUsers, activeTeams, recentSubmissions, liveEvents] = await Promise.all([
      // Users who have been active in the last hour (based on recent activities or logins)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: oneHourAgo,
          },
        },
      }),

      // Teams that have been active recently (new members, updates, etc.)
      prisma.team.count({
        where: {
          OR: [
            {
              updatedAt: {
                gte: twentyFourHoursAgo,
              },
            },
            {
              members: {
                some: {
                  joinedAt: {
                    gte: twentyFourHoursAgo,
                  },
                },
              },
            },
          ],
        },
      }),

      // Submissions created in the last 24 hours
      prisma.submission.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
      }),

      // Active hackathons (in progress or judging)
      prisma.hackathon.count({
        where: {
          status: {
            in: ["IN_PROGRESS", "JUDGING"],
          },
        },
      }),
    ])

    const metrics = {
      onlineUsers: recentActiveUsers,
      activeTeams,
      recentSubmissions,
      liveEvents,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error fetching live metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
