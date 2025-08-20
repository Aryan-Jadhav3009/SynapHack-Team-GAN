"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

function CreateHackathonContent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    theme: "",
    startDate: "",
    endDate: "",
    maxTeamSize: 4,
    rules: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxTeamSize" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/hackathons/${data.id}`)
      } else {
        setError(data.error || "Failed to create hackathon")
      }
    } catch (error) {
      console.error("Error creating hackathon:", error)
      setError("Failed to create hackathon")
    } finally {
      setLoading(false)
    }
  }

  // Check if user has permission to create hackathons
  if (user && user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              You don't have permission to create hackathons. Contact an administrator to become an organizer.
            </AlertDescription>
          </Alert>
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
              <Link href="/hackathons">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
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
          <h1 className="text-3xl font-bold mb-2">Create New Hackathon</h1>
          <p className="text-muted-foreground">Set up your hackathon and start building the future</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hackathon Details</CardTitle>
            <CardDescription>Fill in the information about your hackathon</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter hackathon title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your hackathon..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  name="theme"
                  placeholder="e.g., AI, Sustainability, FinTech"
                  value={formData.theme}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
                <Input
                  id="maxTeamSize"
                  name="maxTeamSize"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxTeamSize}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Rules & Guidelines</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  placeholder="Enter rules and guidelines for participants..."
                  value={formData.rules}
                  onChange={handleChange}
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Hackathon
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/hackathons">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CreateHackathonPage() {
  return (
    <AuthGuard>
      <CreateHackathonContent />
    </AuthGuard>
  )
}
