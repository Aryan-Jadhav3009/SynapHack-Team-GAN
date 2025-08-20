import { type NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()

    if (!prisma) {
      // Mock teams data
      const mockTeams = [
        {
          id: "team-1",
          name: "AI Innovators",
          description: "Building next-generation AI solutions for healthcare and sustainability",
          hackathonTitle: "AI Innovation Challenge 2024",
          requiredSkills: ["Python", "Machine Learning", "TensorFlow", "React"],
          lookingForRoles: ["Frontend Developer", "Data Scientist"],
          memberCount: 2,
          maxMembers: 4,
          members: [
            { user: { firstName: "John", lastName: "Doe", avatar: null } },
            { user: { firstName: "Jane", lastName: "Smith", avatar: null } },
          ],
        },
        {
          id: "team-2",
          name: "Web3 Builders",
          description: "Creating decentralized applications for the future of finance",
          hackathonTitle: "Blockchain Hackathon 2024",
          requiredSkills: ["Solidity", "Web3", "React", "Node.js"],
          lookingForRoles: ["Smart Contract Developer", "UI/UX Designer"],
          memberCount: 3,
          maxMembers: 5,
          members: [
            { user: { firstName: "Alice", lastName: "Johnson", avatar: null } },
            { user: { firstName: "Bob", lastName: "Wilson", avatar: null } },
            { user: { firstName: "Carol", lastName: "Davis", avatar: null } },
          ],
        },
        {
          id: "team-3",
          name: "EcoTech Solutions",
          description: "Developing sustainable technology solutions for environmental challenges",
          hackathonTitle: "Sustainability Tech Challenge",
          requiredSkills: ["React", "Node.js", "IoT", "Data Visualization"],
          lookingForRoles: ["Mobile Developer", "Hardware Engineer"],
          memberCount: 2,
          maxMembers: 4,
          members: [
            { user: { firstName: "David", lastName: "Brown", avatar: null } },
            { user: { firstName: "Emma", lastName: "Garcia", avatar: null } },
          ],
        },
        {
          id: "team-4",
          name: "HealthTech Pioneers",
          description: "Revolutionizing healthcare through innovative digital solutions",
          hackathonTitle: "HealthTech Innovation Summit",
          requiredSkills: ["React Native", "Python", "Healthcare APIs", "FHIR"],
          lookingForRoles: ["Mobile Developer", "Backend Developer"],
          memberCount: 1,
          maxMembers: 3,
          members: [{ user: { firstName: "Michael", lastName: "Lee", avatar: null } }],
        },
      ]

      return NextResponse.json({ teams: mockTeams })
    }

    // Real database query would go here
    const teams = await prisma.team.findMany({
      where: {
        members: {
          none: {
            userId: user.id,
          },
        },
        hackathon: {
          status: {
            in: ["REGISTRATION_OPEN", "IN_PROGRESS"],
          },
        },
      },
      include: {
        hackathon: {
          select: {
            title: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
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

    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      hackathonTitle: team.hackathon.title,
      requiredSkills: team.requiredSkills || [],
      lookingForRoles: team.lookingForRoles || [],
      memberCount: team._count.members,
      maxMembers: team.maxMembers || 4,
      members: team.members,
    }))

    return NextResponse.json({ teams: formattedTeams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
