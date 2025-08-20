"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Code2, Users, Crown, Edit, UserMinus, Github, Linkedin, ArrowLeft, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface TeamMember {
  id: string
  role: string
  status: string
  joinedAt: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    skills: string[]
    bio?: string
    github?: string
    linkedin?: string
  }
}

interface TeamDetail {
  id: string
  name: string
  description?: string
  createdAt: string
  members: TeamMember[]
  hackathon: {
    id: string
    title: string
    maxTeamSize: number
    status: string
  }
  submission?: {
    id: string
    title: string
    description: string
    submittedAt: string
  }
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({ name: "", description: "" })

  useEffect(() => {
    if (params.id) {
      fetchTeam()
    }
  }, [params.id])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setTeam(data)
        setEditFormData({ name: data.name, description: data.description || "" })
      } else {
        setError(data.error || "Failed to load team")
      }
    } catch (error) {
      console.error("Error fetching team:", error)
      setError("Failed to load team")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return

    try {
      const response = await fetch(`/api/teams/${params.id}/join`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/hackathons/${team?.hackathon.id}/teams`)
      } else {
        setError(data.error || "Failed to leave team")
      }
    } catch (error) {
      console.error("Error leaving team:", error)
      setError("Failed to leave team")
    }
  }

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/teams/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      const data = await response.json()

      if (response.ok) {
        setTeam(data)
        setEditDialogOpen(false)
      } else {
        setError(data.error || "Failed to update team")
      }
    } catch (error) {
      console.error("Error updating team:", error)
      setError("Failed to update team")
    }
  }

  if (loading) {
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

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Team not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const userMember = team.members.find((member) => member.user.id === user?.id)
  const isTeamLeader = userMember?.role === "LEADER"
  const isTeamMember = !!userMember

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/hackathons/${team.hackathon.id}/teams`}>
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
          <div className="flex items-center gap-4">
            {isTeamLeader && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Team</DialogTitle>
                    <DialogDescription>Update your team information</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateTeam} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Team Name</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editFormData.description}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Update Team
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
                  <p className="text-muted-foreground">
                    Team for{" "}
                    <Link href={`/hackathons/${team.hackathon.id}`} className="text-primary hover:underline">
                      {team.hackathon.title}
                    </Link>
                  </p>
                </div>
                <Badge variant="outline">
                  {team.members.length}/{team.hackathon.maxTeamSize} members
                </Badge>
              </div>
              {team.description && <p className="text-lg leading-relaxed">{team.description}</p>}
            </div>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.user.firstName[0]}
                          {member.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </h3>
                          {member.role === "LEADER" && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Leader
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">@{member.user.username}</p>
                        {member.user.bio && <p className="text-sm mb-2">{member.user.bio}</p>}
                        {member.user.skills && member.user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {member.user.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          {member.user.github && (
                            <a
                              href={`https://github.com/${member.user.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {member.user.linkedin && (
                            <a
                              href={`https://linkedin.com/in/${member.user.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Submission */}
            {team.submission ? (
              <Card>
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{team.submission.title}</h3>
                      <p className="text-muted-foreground">{team.submission.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(team.submission.submittedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/submissions/${team.submission.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Submission
                        </Link>
                      </Button>
                      {isTeamMember && (
                        <Button variant="outline" asChild>
                          <Link href={`/teams/${team.id}/submit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Submission
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : !isTeamMember ? (
              <Card>
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                  <CardDescription>You must be a team member to submit projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Only team members can submit projects for this hackathon. Join this team to participate in
                      submissions.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                  <CardDescription>Ready to submit your project?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Submit your project anytime before the deadline. Make sure all team members have contributed.
                      </AlertDescription>
                    </Alert>
                    <Button asChild className="w-full">
                      <Link href={`/teams/${team.id}/submit`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Submit Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Submission */}
            {/* {team.submission ? (
              <Card>
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium">{team.submission.title}</h3>
                    <p className="text-muted-foreground">{team.submission.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(team.submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : isTeamMember && team.hackathon.status === "IN_PROGRESS" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                  <CardDescription>Ready to submit your project?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/teams/${team.id}/submit`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Submit Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {isTeamMember && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="destructive" size="sm" onClick={handleLeaveTeam} className="w-full">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Leave Team
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Team Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium">
                    {team.members.length}/{team.hackathon.maxTeamSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(team.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">{team.hackathon.status.replace("_", " ")}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Skills Overview */}
            {team.members.some((member) => member.user.skills && member.user.skills.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(team.members.flatMap((member) => member.user.skills || []))).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
