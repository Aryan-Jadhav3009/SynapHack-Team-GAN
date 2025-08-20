import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET /api/admin/stats - Get platform statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [
      totalUsers,
      totalHackathons,
      totalTeams,
      totalSubmissions,
      totalJudgments,
      usersByRole,
      hackathonsByStatus,
      recentUsers,
      recentHackathons,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.hackathon.count(),
      prisma.team.count(),
      prisma.submission.count(),
      prisma.judgment.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.hackathon.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.hackathon.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              participations: true,
              submissions: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      overview: {
        totalUsers,
        totalHackathons,
        totalTeams,
        totalSubmissions,
        totalJudgments,
      },
      usersByRole: usersByRole.reduce(
        (acc, item) => {
          acc[item.role] = item._count.role
          return acc
        },
        {} as Record<string, number>,
      ),
      hackathonsByStatus: hackathonsByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status
          return acc
        },
        {} as Record<string, number>,
      ),
      recent: {
        users: recentUsers,
        hackathons: recentHackathons,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
