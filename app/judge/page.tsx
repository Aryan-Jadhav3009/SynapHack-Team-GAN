"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, Search, Star, Users, Trophy, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

interface Submission {
  id: string
  title: string
  description: string
  submittedAt: string
  team: {
    id: string
    name: string
    members: Array<{
      user: {
        id: string
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
  }
  hackathon: {
    id: string
    title: string
    status: string
  }
  judgments: Array<{
    id: string
    totalScore: number
    judge: {
      id: string
      firstName: string
      lastName: string
    }
  }>
}

interface Hackathon {
  id: string
  title: string
  status: string
  _count: {
    submissions: number
  }
}

function JudgeDashboardContent() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHackathons()
    fetchSubmissions()
  }, [selectedHackathon])

  const fetchHackathons = async () => {
    try {
      const response = await fetch("/api/hackathons?status=JUDGING")
      const data = await response.json()
      if (response.ok) {
        setHackathons(data.hackathons)
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedHackathon !== "all") {
        params.append("hackathonId", selectedHackathon)
      }

      const response = await fetch(`/api/submissions?${params}`)
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
      submission.team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getJudgmentStatus = (submission: Submission) => {
    const userJudgment = submission.judgments.find((j) => j.judge.id === user?.id)
    return userJudgment ? "Judged" : "Pending"
  }

  const getUserScore = (submission: Submission) => {
    const userJudgment = submission.judgments.find((j) => j.judge.id === user?.id)
    return userJudgment?.totalScore
  }

  // Check if user has judge permissions
  if (user && user.role !== "JUDGE" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the judge dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SynapHack</span>
            <Badge variant="secondary" className="ml-2">
              Judge
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Judge Dashboard</h1>
          <p className="text-muted-foreground">Review and score hackathon submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Judged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter((s) => getJudgmentStatus(s) === "Judged").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter((s) => getJudgmentStatus(s) === "Pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Hackathons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hackathons.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by hackathon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hackathons</SelectItem>
              {hackathons.map((hackathon) => (
                <SelectItem key={hackathon.id} value={hackathon.id}>
                  {hackathon.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <p className="text-muted-foreground">No submissions available for judging at this time</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => {
              const status = getJudgmentStatus(submission)
              const userScore = getUserScore(submission)

              return (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="line-clamp-2">{submission.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={status === "Judged" ? "default" : "secondary"}>{status}</Badge>
                        {userScore && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {userScore.toFixed(1)}
                          </Badge>
                        )}
                      </div>
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

                      {/* Hackathon */}
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{submission.hackathon.title}</span>
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
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                          <Link href={`/submissions/${submission.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" asChild className="flex-1">
                          <Link href={`/judge/submissions/${submission.id}`}>
                            <Star className="w-4 h-4 mr-2" />
                            {status === "Judged" ? "Update" : "Judge"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function JudgeDashboardPage() {
  return (
    <AuthGuard>
      <JudgeDashboardContent />
    </AuthGuard>
  )
}
