import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET /api/hackathons/[id]/check-registration - Check if user is registered
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ isRegistered: false })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ isRegistered: false })
    }

    const participation = await prisma.participation.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: id,
        },
      },
    })

    return NextResponse.json({ isRegistered: !!participation })
  } catch (error) {
    console.error("Error checking registration:", error)
    return NextResponse.json({ isRegistered: false })
  }
}
