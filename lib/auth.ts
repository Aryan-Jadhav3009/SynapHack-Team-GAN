import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { azureConfig } from "./azure-config"
import { prisma } from "./prisma"
import type { User } from "@prisma/client"
import type { NextRequest } from "next/server"

export interface AuthUser {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    azureConfig.jwt.secret,
    { expiresIn: azureConfig.jwt.expiresIn },
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, azureConfig.jwt.secret) as AuthUser
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  return prisma.user.findUnique({
    where: { id: decoded.id },
  })
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    // Return the decoded user info with additional fields needed
    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      firstName: decoded.firstName || "",
      lastName: decoded.lastName || "",
      role: decoded.role,
      avatar: decoded.avatar,
    }
  } catch (error) {
    console.error("Auth verification failed:", error)
    return null
  }
}
