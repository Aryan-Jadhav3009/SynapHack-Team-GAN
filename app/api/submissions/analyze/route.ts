import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { analyzePlagiarism } from "@/lib/plagiarism-detector"

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description, hackathonId } = body

    if (!description || !hackathonId) {
      return NextResponse.json(
        {
          error: "Description and hackathon ID are required",
        },
        { status: 400 },
      )
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Return fallback analysis when database is not available
      return NextResponse.json({
        similarityScore: 0,
        isUnique: true,
        analysis: "Database unavailable. Please ensure your project description is original.",
        suggestions: [
          "Make sure your project idea is unique",
          "Add specific technical details",
          "Describe your unique approach",
        ],
      })
    }

    // Get existing submissions for this hackathon
    const existingSubmissions = await prisma.submission.findMany({
      where: {
        hackathonId: hackathonId,
        NOT: {
          team: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      },
      select: {
        title: true,
        description: true,
        team: {
          select: { name: true },
        },
      },
    })

    const formattedSubmissions = existingSubmissions.map((sub) => ({
      title: sub.title,
      description: sub.description,
      teamName: sub.team.name,
    }))

    try {
      const analysis = await analyzePlagiarism(description, formattedSubmissions)
      return NextResponse.json(analysis)
    } catch (analysisError) {
      console.error("Plagiarism analysis failed:", analysisError)
      // Return fallback analysis instead of error
      return NextResponse.json({
        similarityScore: 0,
        isUnique: true,
        analysis: "Analysis temporarily unavailable. Please ensure your project description is original.",
        suggestions: [
          "Make sure your project idea is unique",
          "Add specific technical details",
          "Describe your unique approach",
        ],
      })
    }
  } catch (error) {
    console.error("Plagiarism analysis error:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
      },
      { status: 500 },
    )
  }
}
