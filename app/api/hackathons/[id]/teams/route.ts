import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const prisma = await getPrismaClient()

    if (!prisma) {
      return NextResponse.json({
        teams: [
          {
            id: "team-1",
            name: "Code Warriors",
            description: "Full-stack developers building innovative solutions",
            hackathonId: id,
            memberCount: 3,
            maxMembers: 4,
            requiredSkills: ["React", "Node.js", "Python"],
            lookingForRoles: ["UI/UX Designer"],
            members: [
              { id: "1", firstName: "John", lastName: "Doe", avatar: null, role: "LEADER" },
              { id: "2", firstName: "Jane", lastName: "Smith", avatar: null, role: "MEMBER" },
              { id: "3", firstName: "Bob", lastName: "Johnson", avatar: null, role: "MEMBER" },
            ],
          },
          {
            id: "team-2",
            name: "AI Innovators",
            description: "Machine learning enthusiasts creating smart solutions",
            hackathonId: id,
            memberCount: 2,
            maxMembers: 4,
            requiredSkills: ["Python", "TensorFlow", "Machine Learning"],
            lookingForRoles: ["Frontend Developer", "Data Scientist"],
            members: [
              { id: "4", firstName: "Alice", lastName: "Wilson", avatar: null, role: "LEADER" },
              { id: "5", firstName: "Charlie", lastName: "Brown", avatar: null, role: "MEMBER" },
            ],
          },
        ],
      })
    }

    const teams = await prisma.team.findMany({
      where: {
        hackathonId: id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                skills: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      const mockTeam = {
        id: `team-${Date.now()}`,
        name: name.trim(),
        description: description?.trim() || null,
        hackathonId: id,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: `member-${Date.now()}`,
            userId: user.id,
            role: "LEADER",
            status: "ACCEPTED",
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              avatar: user.avatar,
            },
          },
        ],
      }

      return NextResponse.json({ team: mockTeam })
    }

    // Check if user is registered for this hackathon
    const participation = await prisma.participation.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "You must be registered for this hackathon to create a team" }, { status: 400 })
    }

    // Check if user is already in a team for this hackathon
    const existingTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: {
          hackathonId: id,
        },
      },
    })

    if (existingTeamMember) {
      return NextResponse.json({ error: "You are already in a team for this hackathon" }, { status: 400 })
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        hackathonId: id,
        members: {
          create: {
            userId: user.id,
            role: "LEADER",
            status: "ACCEPTED",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                skills: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
