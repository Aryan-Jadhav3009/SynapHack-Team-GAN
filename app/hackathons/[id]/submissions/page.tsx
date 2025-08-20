"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Code2, Search, ExternalLink, Github, Play, Users, Star, ArrowLeft, Trophy } from "lucide-react"

interface Submission {
  id: string
  title: string
  description: string
  demoUrl?: string
  repoUrl?: string
  videoUrl?: string
  images: string[]
  submittedAt: string
  team: {
    id: string
    name: string
    members: Array<{
      user: {
        id: string
        username: string
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
  }
  submitter: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  _count: {
    judgments: number
  }
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function HackathonSubmissionsPage() {
  const params = useParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchHackathon()
      fetchSubmissions()
    }
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setHackathon(data)
      }
    } catch (error) {
      console.error("Error fetching hackathon:", error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/submissions?hackathonId=${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/hackathons/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathon
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Submissions</h1>
          <p className="text-muted-foreground">
            {hackathon ? `Browse submissions for ${hackathon.title}` : "Browse project submissions"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Submissions Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No projects have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="line-clamp-2">{submission.title}</CardTitle>
                    {submission._count.judgments > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {submission._count.judgments}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3">{submission.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Team Info */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{submission.team.name}</span>
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {submission.team.members.slice(0, 3).map((member) => (
                          <Avatar key={member.user.id} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {submission.team.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs">+{submission.team.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {submission.team.members.length} member{submission.team.members.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Project Links */}
                    <div className="flex gap-2">
                      {submission.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                      {submission.repoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                      {submission.videoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Play className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* View Submission */}
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href={`/submissions/${submission.id}`}>View Submission</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
