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
      // Mock teammates data with skill-based matching
      const mockTeammates = [
        {
          id: "user-1",
          firstName: "Sarah",
          lastName: "Chen",
          username: "sarahc",
          avatar: null,
          bio: "Full-stack developer passionate about AI and machine learning. Love building innovative solutions.",
          skills: ["React", "Node.js", "Python", "Machine Learning", "TypeScript"],
          location: "San Francisco, CA",
          githubUrl: "https://github.com/sarahc",
          linkedinUrl: "https://linkedin.com/in/sarahc",
          lookingForTeam: true,
          preferredRoles: ["Frontend Developer", "AI Engineer"],
          hackathonExperience: 8,
          matchScore: 95,
        },
        {
          id: "user-2",
          firstName: "Alex",
          lastName: "Rodriguez",
          username: "alexr",
          avatar: null,
          bio: "UI/UX designer with a passion for creating beautiful and intuitive user experiences.",
          skills: ["UI/UX Design", "Figma", "React", "CSS", "User Research"],
          location: "New York, NY",
          githubUrl: "https://github.com/alexr",
          websiteUrl: "https://alexr.design",
          lookingForTeam: true,
          preferredRoles: ["UI/UX Designer", "Product Designer"],
          hackathonExperience: 5,
          matchScore: 87,
        },
        {
          id: "user-3",
          firstName: "David",
          lastName: "Kim",
          username: "davidk",
          avatar: null,
          bio: "Backend engineer specializing in scalable systems and cloud architecture.",
          skills: ["Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
          location: "Seattle, WA",
          githubUrl: "https://github.com/davidk",
          linkedinUrl: "https://linkedin.com/in/davidk",
          lookingForTeam: false,
          preferredRoles: ["Backend Developer", "DevOps Engineer"],
          hackathonExperience: 12,
          matchScore: 78,
        },
        {
          id: "user-4",
          firstName: "Emma",
          lastName: "Wilson",
          username: "emmaw",
          avatar: null,
          bio: "Mobile developer with expertise in React Native and Flutter. Love creating cross-platform apps.",
          skills: ["React Native", "Flutter", "iOS", "Android", "JavaScript"],
          location: "Austin, TX",
          githubUrl: "https://github.com/emmaw",
          lookingForTeam: true,
          preferredRoles: ["Mobile Developer", "Frontend Developer"],
          hackathonExperience: 3,
          matchScore: 82,
        },
        {
          id: "user-5",
          firstName: "Michael",
          lastName: "Brown",
          username: "michaelb",
          avatar: null,
          bio: "Data scientist and ML engineer. Experienced in building predictive models and data pipelines.",
          skills: ["Python", "Machine Learning", "TensorFlow", "Data Science", "SQL"],
          location: "Boston, MA",
          githubUrl: "https://github.com/michaelb",
          linkedinUrl: "https://linkedin.com/in/michaelb",
          lookingForTeam: true,
          preferredRoles: ["Data Scientist", "ML Engineer"],
          hackathonExperience: 6,
          matchScore: 91,
        },
        {
          id: "user-6",
          firstName: "Lisa",
          lastName: "Garcia",
          username: "lisag",
          avatar: null,
          bio: "Blockchain developer passionate about DeFi and Web3 technologies.",
          skills: ["Solidity", "Web3", "Blockchain", "JavaScript", "Smart Contracts"],
          location: "Miami, FL",
          githubUrl: "https://github.com/lisag",
          lookingForTeam: true,
          preferredRoles: ["Blockchain Developer", "Smart Contract Developer"],
          hackathonExperience: 4,
          matchScore: 73,
        },
      ]

      return NextResponse.json({ teammates: mockTeammates })
    }

    // Real database query would go here
    const teammates = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        lookingForTeam: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        bio: true,
        skills: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        lookingForTeam: true,
        preferredRoles: true,
        hackathonExperience: true,
      },
    })

    return NextResponse.json({ teammates })
  } catch (error) {
    console.error("Error fetching teammates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
