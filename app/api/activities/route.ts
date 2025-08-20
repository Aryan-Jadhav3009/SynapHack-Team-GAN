import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock activity data when database is not available
      const mockActivities = [
        {
          id: "1",
          type: "hackathon_created",
          message: "AI Innovation Challenge 2024 was created",
          user: { firstName: "Sarah", lastName: "Chen" },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { hackathonTitle: "AI Innovation Challenge 2024" },
        },
        {
          id: "2",
          type: "team_created",
          message: "Team 'Code Warriors' was formed",
          user: { firstName: "Alex", lastName: "Johnson" },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          metadata: { teamName: "Code Warriors" },
        },
        {
          id: "3",
          type: "user_registered",
          message: "New participant joined the platform",
          user: { firstName: "Maria", lastName: "Garcia" },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          metadata: {},
        },
        {
          id: "4",
          type: "submission_created",
          message: "Project 'EcoTracker' was submitted",
          user: { firstName: "David", lastName: "Kim" },
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          metadata: { projectName: "EcoTracker" },
        },
        {
          id: "5",
          type: "hackathon_started",
          message: "Web3 Builders Hackathon has started",
          user: { firstName: "Emma", lastName: "Wilson" },
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          metadata: { hackathonTitle: "Web3 Builders Hackathon" },
        },
      ]

      return NextResponse.json({
        activities: mockActivities.slice(0, limit),
      })
    }

    try {
      const activities = await prisma.activity.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      })
      return NextResponse.json({ activities })
    } catch (dbError) {
      console.log("Activity table not found, using mock data")
      // Return mock data if activity table doesn't exist
      const mockActivities = [
        {
          id: "1",
          type: "hackathon_created",
          message: "AI Innovation Challenge 2024 was created",
          user: { firstName: "Sarah", lastName: "Chen" },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { hackathonTitle: "AI Innovation Challenge 2024" },
        },
      ]
      return NextResponse.json({ activities: mockActivities.slice(0, limit) })
    }
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
