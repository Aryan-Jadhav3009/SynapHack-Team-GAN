import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET /api/teams/[id] - Get team details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                skills: true,
                bio: true,
                github: true,
                linkedin: true,
              },
            },
          },
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            maxTeamSize: true,
            status: true,
          },
        },
        submission: {
          select: {
            id: true,
            title: true,
            description: true,
            submittedAt: true,
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/teams/[id] - Update team
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

    // Check if user is team leader
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: user.id,
        role: "LEADER",
      },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "Only team leaders can update team details" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                skills: true,
              },
            },
          },
        },
        hackathon: {
          select: {
            title: true,
            maxTeamSize: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
