const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log("Setting up database...")

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@synaphack.com" },
      update: {},
      create: {
        email: "admin@synaphack.com",
        firstName: "Admin",
        lastName: "User",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        role: "ADMIN",
        bio: "Platform administrator",
      },
    })

    console.log("Admin user created:", adminUser.email)

    // Create sample hackathon
    const hackathon = await prisma.hackathon.create({
      data: {
        title: "SynapHack 2024",
        description: "The premier hackathon for innovative solutions",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-03"),
        registrationDeadline: new Date("2024-05-25"),
        maxTeamSize: 4,
        status: "UPCOMING",
        organizerId: adminUser.id,
        prizes: ["$10,000 Grand Prize", "$5,000 Second Place", "$2,500 Third Place"],
        rules: ["Teams of 1-4 members", "Original code only", "Must present to judges"],
        judgingCriteria: [
          { name: "Innovation", weight: 30, description: "Originality and creativity of the solution" },
          { name: "Technical Implementation", weight: 25, description: "Quality of code and technical execution" },
          { name: "Business Impact", weight: 25, description: "Potential real-world impact and viability" },
          { name: "Presentation", weight: 20, description: "Quality of demo and presentation" },
        ],
      },
    })

    console.log("Sample hackathon created:", hackathon.title)
    console.log("Database setup complete!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
