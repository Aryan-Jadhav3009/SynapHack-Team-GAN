import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | null = null

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      try {
        // Check if we have a valid connection string
        if (
          !process.env.AZURE_SQL_CONNECTION_STRING ||
          process.env.AZURE_SQL_CONNECTION_STRING.includes("placeholder")
        ) {
          throw new Error("Database not configured")
        }

        prismaInstance = globalForPrisma.prisma ?? new PrismaClient()
        if (process.env.NODE_ENV !== "production") {
          globalForPrisma.prisma = prismaInstance
        }
      } catch (error) {
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return prismaInstance[prop as keyof PrismaClient]
  },
})

export async function getPrismaClient(): Promise<PrismaClient | null> {
  try {
    // Check if we have a valid connection string
    if (!process.env.AZURE_SQL_CONNECTION_STRING || process.env.AZURE_SQL_CONNECTION_STRING.includes("placeholder")) {
      return null // Return null when database is not configured (development mode)
    }

    if (!prismaInstance) {
      prismaInstance = globalForPrisma.prisma ?? new PrismaClient()
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance
      }
    }

    return prismaInstance
  } catch (error) {
    console.error("Database connection failed:", error)
    return null
  }
}
