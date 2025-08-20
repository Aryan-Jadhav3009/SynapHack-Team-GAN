import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock announcements data
      const mockAnnouncements = [
        {
          id: "ann-1",
          title: "Welcome to AI Innovation Challenge 2024!",
          content:
            "We're excited to have you join us for this amazing hackathon! Please make sure to read the rules and guidelines carefully. Don't forget to form your teams by the end of the registration period.",
          type: "info",
          author: {
            firstName: "Sarah",
            lastName: "Johnson",
            avatar: null,
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 156,
          pinned: true,
        },
        {
          id: "ann-2",
          title: "Important: Submission Deadline Extended",
          content:
            "Due to popular request, we're extending the submission deadline by 2 hours. The new deadline is Sunday at 11:59 PM PST. Make sure to submit your projects on time!",
          type: "warning",
          author: {
            firstName: "Sarah",
            lastName: "Johnson",
            avatar: null,
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          views: 89,
          pinned: false,
        },
        {
          id: "ann-3",
          title: "Judging Criteria Released",
          content:
            "The judging criteria have been published! Projects will be evaluated based on:\n\n1. Innovation and Creativity (30%)\n2. Technical Implementation (25%)\n3. User Experience (20%)\n4. Business Viability (15%)\n5. Presentation Quality (10%)\n\nGood luck to all teams!",
          type: "success",
          author: {
            firstName: "Sarah",
            lastName: "Johnson",
            avatar: null,
          },
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          views: 234,
          pinned: false,
        },
      ]

      return NextResponse.json({ announcements: mockAnnouncements })
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        hackathonId: params.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, type, pinned } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock response when database is not available
      const mockAnnouncement = {
        id: `ann-${Date.now()}`,
        title,
        content,
        type: type || "info",
        author: {
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        createdAt: new Date().toISOString(),
        views: 0,
        pinned: pinned || false,
      }

      return NextResponse.json(mockAnnouncement, { status: 201 })
    }

    // Check if user is the organizer of this hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      select: { organizerId: true },
    })

    if (!hackathon || hackathon.organizerId !== user.id) {
      return NextResponse.json({ error: "Only the organizer can create announcements" }, { status: 403 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || "info",
        pinned: pinned || false,
        hackathonId: params.id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
