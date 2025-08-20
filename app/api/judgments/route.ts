import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

const createJudgmentSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  hackathonId: z.string().min(1, "Hackathon ID is required"),
  criteria: z.record(z.number().min(0).max(10), "Score must be between 0 and 10"),
  feedback: z.string().optional(),
})

// GET /api/judgments - Get judgments for a hackathon or judge
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || (user.role !== "JUDGE" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")
    const submissionId = searchParams.get("submissionId")

    const where: any = {}

    if (user.role === "JUDGE") {
      where.judgeId = user.id
    }

    if (hackathonId) {
      where.hackathonId = hackathonId
    }

    if (submissionId) {
      where.submissionId = submissionId
    }

    const judgments = await prisma.judgment.findMany({
      where,
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        judge: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ judgments })
  } catch (error) {
    console.error("Error fetching judgments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/judgments - Create or update judgment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || (user.role !== "JUDGE" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, hackathonId, criteria, feedback } = createJudgmentSchema.parse(body)

    // Calculate total score
    const scores = Object.values(criteria)
    const totalScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // Check if judgment already exists
    const existingJudgment = await prisma.judgment.findUnique({
      where: {
        submissionId_judgeId: {
          submissionId,
          judgeId: user.id,
        },
      },
    })

    let judgment
    if (existingJudgment) {
      // Update existing judgment
      judgment = await prisma.judgment.update({
        where: { id: existingJudgment.id },
        data: {
          criteria,
          totalScore,
          feedback,
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          judge: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    } else {
      // Create new judgment
      judgment = await prisma.judgment.create({
        data: {
          submissionId,
          judgeId: user.id,
          hackathonId,
          criteria,
          totalScore,
          feedback,
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          judge: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    }

    return NextResponse.json(judgment, { status: existingJudgment ? 200 : 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error creating/updating judgment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
