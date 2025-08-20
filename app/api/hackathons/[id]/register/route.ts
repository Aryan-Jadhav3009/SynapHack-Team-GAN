import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// POST /api/hackathons/[id]/register - Register for hackathon
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    if (hackathon.status !== "REGISTRATION_OPEN" && hackathon.status !== "UPCOMING") {
      return NextResponse.json({ error: "Registration is not open" }, { status: 400 })
    }

    // Check if already registered
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: id,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        {
          message: "Already registered for this hackathon",
          participation: existingParticipation,
        },
        { status: 200 },
      )
    }

    const participation = await prisma.participation.create({
      data: {
        userId: user.id,
        hackathonId: id,
      },
    })

    return NextResponse.json({ message: "Successfully registered", participation }, { status: 201 })
  } catch (error) {
    console.error("Error registering for hackathon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/hackathons/[id]/register - Unregister from hackathon
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const participation = await prisma.participation.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "Not registered for this hackathon" }, { status: 400 })
    }

    await prisma.participation.delete({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: id,
        },
      },
    })

    return NextResponse.json({ message: "Successfully unregistered" })
  } catch (error) {
    console.error("Error unregistering from hackathon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
