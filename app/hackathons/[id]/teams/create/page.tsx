"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code2, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

interface Hackathon {
  id: string
  title: string
  status: string
  maxTeamSize: number
}

function CreateTeamContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchHackathon()
    }
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setHackathon(data)
      } else {
        setError(data.error || "Failed to load hackathon")
      }
    } catch (error) {
      console.error("Error fetching hackathon:", error)
      setError("Failed to load hackathon")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/hackathons/${params.id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/teams/${data.team.id}`)
      } else {
        setError(data.error || "Failed to create team")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      setError("Failed to create team")
    } finally {
      setLoading(false)
    }
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/hackathons/${params.id}/teams`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SynapHack</span>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Team</h1>
          <p className="text-muted-foreground">
            Create a team for <span className="font-medium">{hackathon.title}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
            <CardDescription>
              Set up your team and start collaborating. Maximum team size: {hackathon.maxTeamSize} members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your team name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your team, what you're looking for in teammates, your project idea..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Team
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/hackathons/${params.id}/teams`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CreateTeamPage() {
  return (
    <AuthGuard>
      <CreateTeamContent />
    </AuthGuard>
  )
}
