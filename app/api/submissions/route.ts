import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

const createSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required"),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  teamId: z.string().min(1, "Team ID is required"),
  images: z.array(z.string()).optional().default([]),
})

// GET /api/submissions - List submissions for a hackathon
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")
    const teamId = searchParams.get("teamId")

    if (!hackathonId && !teamId) {
      return NextResponse.json({ error: "Hackathon ID or Team ID is required" }, { status: 400 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock submissions data
      const mockSubmissions = [
        {
          id: "sub-1",
          title: "EcoTracker - Sustainability Monitor",
          description:
            "A comprehensive platform for tracking and reducing carbon footprint with AI-powered recommendations.",
          submissionType: "demo",
          demoUrl: "https://ecotracker-demo.vercel.app",
          repoUrl: "https://github.com/team1/ecotracker",
          videoUrl: "https://youtube.com/watch?v=demo1",
          images: ["/eco-app-dashboard.png"],
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          team: {
            id: "team-1",
            name: "Green Innovators",
            members: [
              { user: { id: "1", firstName: "Sarah", lastName: "Chen", avatar: null } },
              { user: { id: "2", firstName: "Mike", lastName: "Johnson", avatar: null } },
              { user: { id: "3", firstName: "Lisa", lastName: "Wang", avatar: null } },
            ],
          },
          submitter: { firstName: "Sarah", lastName: "Chen" },
          _count: { judgments: 3 },
        },
        {
          id: "sub-2",
          title: "AI Code Assistant",
          description:
            "An intelligent coding companion that helps developers write better code with real-time suggestions.",
          submissionType: "presentation",
          presentationUrl: "/placeholder.pdf",
          repoUrl: "https://github.com/team2/ai-assistant",
          images: [],
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          team: {
            id: "team-2",
            name: "Code Warriors",
            members: [
              { user: { id: "4", firstName: "Alex", lastName: "Rodriguez", avatar: null } },
              { user: { id: "5", firstName: "Emma", lastName: "Davis", avatar: null } },
            ],
          },
          submitter: { firstName: "Alex", lastName: "Rodriguez" },
          _count: { judgments: 2 },
        },
        {
          id: "sub-3",
          title: "HealthSync - Medical Data Platform",
          description: "Secure platform for managing and sharing medical records between healthcare providers.",
          submissionType: "document",
          documentUrl: "/placeholder.pdf",
          demoUrl: "https://healthsync-demo.com",
          images: ["/medical-dashboard.png"],
          submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          team: {
            id: "team-3",
            name: "MedTech Solutions",
            members: [
              { user: { id: "6", firstName: "David", lastName: "Kim", avatar: null } },
              { user: { id: "7", firstName: "Rachel", lastName: "Brown", avatar: null } },
              { user: { id: "8", firstName: "Tom", lastName: "Wilson", avatar: null } },
              { user: { id: "9", firstName: "Anna", lastName: "Garcia", avatar: null } },
            ],
          },
          submitter: { firstName: "David", lastName: "Kim" },
          _count: { judgments: 1 },
        },
      ]

      return NextResponse.json({ submissions: mockSubmissions })
    }

    const where = hackathonId ? { hackathonId } : { teamId }

    let finalWhere = where
    if (user.role === "PARTICIPANT") {
      // Participants can only see submissions from hackathons they're registered for
      finalWhere = {
        ...where,
        hackathon: {
          participations: {
            some: {
              userId: user.id,
            },
          },
        },
      }
    }

    const submissions = await prisma.submission.findMany({
      where: finalWhere,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
          },
        },
        submitter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            judgments: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting submission creation")

    const user = await verifyAuth(request)
    if (!user) {
      console.log("[v0] Auth verification failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("[v0] User authenticated:", user.id)

    const body = await request.json()
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    const data = createSubmissionSchema.parse(body)
    console.log("[v0] Data validation passed")

    const prisma = await getPrismaClient()

    if (!prisma) {
      console.log("[v0] No database connection, returning mock response")
      // Mock response when database is not available
      const mockSubmission = {
        id: `sub-${Date.now()}`,
        title: data.title,
        description: data.description,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        videoUrl: data.videoUrl || null,
        images: data.images,
        teamId: data.teamId,
        submitterId: user.id,
        submittedAt: new Date().toISOString(),
      }

      return NextResponse.json(mockSubmission, { status: 201 })
    }

    console.log("[v0] Checking team membership for teamId:", data.teamId)
    // Check if user is a member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: data.teamId,
        userId: user.id,
        status: "ACCEPTED",
      },
      include: {
        team: {
          include: {
            hackathon: true,
          },
        },
      },
    })

    if (!teamMember) {
      console.log("[v0] User is not a team member")
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 })
    }
    console.log("[v0] Team membership verified")

    // Check if team already has a submission
    const existingSubmission = await prisma.submission.findUnique({
      where: { teamId: data.teamId },
    })

    if (existingSubmission) {
      console.log("[v0] Team already has a submission")
      return NextResponse.json({ error: "Team already has a submission" }, { status: 400 })
    }
    console.log("[v0] No existing submission found")

    const hackathon = teamMember.team.hackathon
    console.log("[v0] Creating submission for hackathon:", hackathon.id)

    const submission = await prisma.submission.create({
      data: {
        title: data.title,
        description: data.description,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        videoUrl: data.videoUrl || null,
        images: data.images.length > 0 ? JSON.stringify(data.images) : null, // Store as JSON string or null
        teamId: data.teamId,
        hackathonId: hackathon.id,
        submitterId: user.id,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
        submitter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    console.log("[v0] Submission created successfully:", submission.id)
    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[v0] Validation error:", error.errors)
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("[v0] Error creating submission:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
