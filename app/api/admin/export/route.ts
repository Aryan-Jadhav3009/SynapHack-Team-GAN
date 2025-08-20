import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/export - Export user registration data
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")
    const format = searchParams.get("format") || "json"

    if (!hackathonId) {
      return NextResponse.json({ error: "Hackathon ID is required" }, { status: 400 })
    }

    // Get all registrations for the hackathon
    const registrations = await prisma.participation.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            skills: true,
            bio: true,
            createdAt: true,
          },
        },
        hackathon: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    if (format === "csv") {
      // Generate CSV format
      const csvHeaders = [
        "Registration Date",
        "Email",
        "Username",
        "First Name",
        "Last Name",
        "Role",
        "Skills",
        "Bio",
        "Account Created",
      ]

      const csvRows = registrations.map((reg) => [
        reg.registeredAt.toISOString(),
        reg.user.email,
        reg.user.username,
        reg.user.firstName,
        reg.user.lastName,
        reg.user.role,
        (reg.user.skills || []).join("; "),
        reg.user.bio || "",
        reg.user.createdAt.toISOString(),
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="hackathon-${hackathonId}-registrations.csv"`,
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      hackathon: registrations[0]?.hackathon.title || "Unknown",
      totalRegistrations: registrations.length,
      exportedAt: new Date().toISOString(),
      registrations: registrations.map((reg) => ({
        registrationDate: reg.registeredAt,
        user: reg.user,
      })),
    })
  } catch (error) {
    console.error("Error exporting registration data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
