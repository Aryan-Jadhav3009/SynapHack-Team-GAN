import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      return NextResponse.json({
        team: null, // User has no team in mock data
      })
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: {
          hackathonId: id,
        },
      },
      include: {
        team: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    })

    if (!teamMember) {
      return NextResponse.json({ team: null })
    }

    const userTeam = {
      id: teamMember.team.id,
      name: teamMember.team.name,
      description: teamMember.team.description,
      memberCount: teamMember.team._count.members,
      isLeader: teamMember.role === "LEADER",
    }

    return NextResponse.json({ team: userTeam })
  } catch (error) {
    console.error("Error fetching user team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
