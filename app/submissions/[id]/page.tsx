"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Code2, ExternalLink, Github, Play, Users, Star, ArrowLeft, Edit, Trophy, ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface Submission {
  id: string
  title: string
  description: string
  demoUrl?: string
  repoUrl?: string
  videoUrl?: string
  images: string[]
  submittedAt: string
  updatedAt: string
  team: {
    id: string
    name: string
    members: Array<{
      id: string
      role: string
      user: {
        id: string
        username: string
        firstName: string
        lastName: string
        avatar?: string
        skills: string[]
      }
    }>
  }
  hackathon: {
    id: string
    title: string
    status: string
    endDate: string
  }
  submitter: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  judgments: Array<{
    id: string
    totalScore: number
    feedback?: string
    judge: {
      id: string
      username: string
      firstName: string
      lastName: string
    }
  }>
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchSubmission()
    }
  }, [params.id])

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setSubmission(data)
      } else {
        setError(data.error || "Failed to load submission")
      }
    } catch (error) {
      console.error("Error fetching submission:", error)
      setError("Failed to load submission")
    } finally {
      setLoading(false)
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

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Submission not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isTeamMember = submission.team.members.some((member) => member.user.id === user?.id)
  const canEdit =
    isTeamMember && (submission.hackathon.status === "IN_PROGRESS" || submission.hackathon.status === "JUDGING")
  const averageScore =
    submission.judgments.length > 0
      ? submission.judgments.reduce((sum, judgment) => sum + judgment.totalScore, 0) / submission.judgments.length
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/hackathons/${submission.hackathon.id}`}>
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
          <div className="flex items-center gap-4">
            {canEdit && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/teams/${submission.team.id}/submit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{submission.hackathon.title}</Badge>
                  <Badge variant={submission.hackathon.status === "COMPLETED" ? "default" : "secondary"}>
                    {submission.hackathon.status.replace("_", " ")}
                  </Badge>
                  {averageScore && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {averageScore.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">{submission.title}</h1>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{submission.description}</p>
              </div>
            </div>

            {/* Project Links */}
            {(submission.demoUrl || submission.repoUrl || submission.videoUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {submission.demoUrl && (
                      <Button variant="outline" asChild>
                        <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {submission.repoUrl && (
                      <Button variant="outline" asChild>
                        <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Repository
                        </a>
                      </Button>
                    )}
                    {submission.videoUrl && (
                      <Button variant="outline" asChild>
                        <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="w-4 h-4 mr-2" />
                          Video Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Screenshots */}
            {submission.images && Array.isArray(submission.images) && submission.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Screenshots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.images.map((image, index) => (
                      <div
                        key={index}
                        className="cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Judgments */}
            {submission.judgments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Judging Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submission.judgments.map((judgment) => (
                      <div key={judgment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {judgment.judge.firstName} {judgment.judge.lastName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Judge
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {judgment.totalScore}
                          </Badge>
                        </div>
                        {judgment.feedback && <p className="text-sm text-muted-foreground">{judgment.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium mb-2">{submission.team.name}</h3>
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href={`/teams/${submission.team.id}`}>View Team</Link>
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {submission.team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {member.user.firstName[0]}
                            {member.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {member.user.firstName} {member.user.lastName}
                        </span>
                        {member.role === "LEADER" && (
                          <Badge variant="outline" className="text-xs">
                            Leader
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="text-sm font-medium">{format(new Date(submission.submittedAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{format(new Date(submission.updatedAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submitted by</span>
                  <span className="text-sm font-medium">
                    {submission.submitter.firstName} {submission.submitter.lastName}
                  </span>
                </div>
                {submission.judgments.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Judges</span>
                    <span className="text-sm font-medium">{submission.judgments.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {submission.team.members.some(
              (member) => member.user.skills && Array.isArray(member.user.skills) && member.user.skills.length > 0,
            ) && (
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(submission.team.members.flatMap((member) => member.user.skills || []))).map(
                      (skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Full size screenshot"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
