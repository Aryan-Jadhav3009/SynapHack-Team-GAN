"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, X, Loader2 } from "lucide-react"

export default function CreateTeamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    maxMembers: 4,
    skills: [] as string[],
    hackathonId: "",
  })
  const [skillInput, setSkillInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTeamData((prev) => ({
      ...prev,
      [name]: name === "maxMembers" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !teamData.skills.includes(skillInput.trim())) {
      setTeamData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setTeamData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      })

      if (!response.ok) throw new Error("Failed to create team")

      const { team } = await response.json()
      router.push(`/teams/${team.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Please log in to create a team.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Create Team
        </h1>
        <p className="text-muted-foreground">Start building your hackathon dream team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>Set up your team and start recruiting members</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your team name"
                value={teamData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your team's goals and what you're looking for..."
                value={teamData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Maximum Team Size</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min="2"
                max="10"
                value={teamData.maxMembers}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {teamData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Team
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
