const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...")

    // Create sample users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "judge@synaphack.com",
          firstName: "Jane",
          lastName: "Judge",
          password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "JUDGE",
          bio: "Experienced tech judge and mentor",
        },
      }),
      prisma.user.create({
        data: {
          email: "organizer@synaphack.com",
          firstName: "Bob",
          lastName: "Organizer",
          password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "ORGANIZER",
          bio: "Hackathon organizer and community builder",
        },
      }),
      prisma.user.create({
        data: {
          email: "participant1@synaphack.com",
          firstName: "Alice",
          lastName: "Developer",
          password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "PARTICIPANT",
          bio: "Full-stack developer passionate about innovation",
          skills: ["React", "Node.js", "Python", "AI/ML"],
        },
      }),
      prisma.user.create({
        data: {
          email: "participant2@synaphack.com",
          firstName: "Charlie",
          lastName: "Designer",
          password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "PARTICIPANT",
          bio: "UX/UI designer with a love for user-centered design",
          skills: ["Figma", "React", "CSS", "User Research"],
        },
      }),
    ])

    console.log(`Created ${users.length} sample users`)

    // Get existing hackathon
    const hackathon = await prisma.hackathon.findFirst()

    if (hackathon) {
      // Create sample team
      const team = await prisma.team.create({
        data: {
          name: "Innovation Squad",
          description: "Building the future, one hack at a time",
          hackathonId: hackathon.id,
          leaderId: users[2].id, // Alice as leader
          lookingForMembers: true,
          skillsNeeded: ["Backend Development", "Mobile Development"],
        },
      })

      // Add team member
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: users[3].id, // Charlie joins the team
          role: "MEMBER",
        },
      })

      console.log("Created sample team with members")

      // Register users for hackathon
      await Promise.all([
        prisma.hackathonParticipation.create({
          data: {
            hackathonId: hackathon.id,
            userId: users[2].id,
          },
        }),
        prisma.hackathonParticipation.create({
          data: {
            hackathonId: hackathon.id,
            userId: users[3].id,
          },
        }),
      ])

      console.log("Registered users for hackathon")
    }

    console.log("Database seeding complete!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
