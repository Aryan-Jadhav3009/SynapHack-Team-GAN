import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// POST /api/teams/[id]/join - Join team
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: true,
        hackathon: {
          select: {
            id: true,
            maxTeamSize: true,
            status: true,
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if user is registered for the hackathon
    const participation = await prisma.participation.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: team.hackathon.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "You must be registered for this hackathon to join a team" }, { status: 400 })
    }

    // Check if user is already in a team for this hackathon
    const existingTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: {
          hackathonId: team.hackathon.id,
        },
      },
    })

    if (existingTeamMember) {
      return NextResponse.json({ error: "You are already in a team for this hackathon" }, { status: 400 })
    }

    // Check if team is full
    if (team.members.length >= team.hackathon.maxTeamSize) {
      return NextResponse.json({ error: "Team is full" }, { status: 400 })
    }

    // Check if hackathon allows team joining
    if (team.hackathon.status === "COMPLETED" || team.hackathon.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot join team for completed or cancelled hackathon" }, { status: 400 })
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: params.id,
        role: "MEMBER",
        status: "ACCEPTED",
      },
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
    })

    return NextResponse.json({ message: "Successfully joined team", teamMember }, { status: 201 })
  } catch (error) {
    console.error("Error joining team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/teams/[id]/join - Leave team
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: user.id,
      },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 400 })
    }

    // If user is the only member and team leader, delete the team
    if (teamMember.role === "LEADER" && teamMember.team.members.length === 1) {
      await prisma.team.delete({
        where: { id: params.id },
      })
      return NextResponse.json({ message: "Team deleted successfully" })
    }

    // If user is team leader but not the only member, transfer leadership
    if (teamMember.role === "LEADER" && teamMember.team.members.length > 1) {
      const nextLeader = teamMember.team.members.find((member) => member.userId !== user.id)
      if (nextLeader) {
        await prisma.teamMember.update({
          where: { id: nextLeader.id },
          data: { role: "LEADER" },
        })
      }
    }

    // Remove user from team
    await prisma.teamMember.delete({
      where: { id: teamMember.id },
    })

    return NextResponse.json({ message: "Successfully left team" })
  } catch (error) {
    console.error("Error leaving team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
