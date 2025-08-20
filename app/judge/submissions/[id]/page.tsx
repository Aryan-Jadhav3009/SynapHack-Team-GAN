"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Code2, ArrowLeft, Star, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

interface Submission {
  id: string
  title: string
  description: string
  demoUrl?: string
  repoUrl?: string
  videoUrl?: string
  images: string[]
  team: {
    id: string
    name: string
  }
  hackathon: {
    id: string
    title: string
  }
}

interface Judgment {
  id: string
  criteria: Record<string, number>
  totalScore: number
  feedback?: string
}

const JUDGING_CRITERIA = {
  innovation: "Innovation & Creativity",
  technical: "Technical Implementation",
  design: "User Experience & Design",
  impact: "Potential Impact",
  presentation: "Presentation Quality",
}

function JudgeSubmissionContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [existingJudgment, setExistingJudgment] = useState<Judgment | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({
    innovation: 5,
    technical: 5,
    design: 5,
    impact: 5,
    presentation: 5,
  })
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchSubmission()
      fetchExistingJudgment()
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

  const fetchExistingJudgment = async () => {
    try {
      const response = await fetch(`/api/judgments?submissionId=${params.id}`)
      const data = await response.json()

      if (response.ok && data.judgments.length > 0) {
        const judgment = data.judgments[0]
        setExistingJudgment(judgment)
        setScores(judgment.criteria)
        setFeedback(judgment.feedback || "")
      }
    } catch (error) {
      console.error("Error fetching existing judgment:", error)
    }
  }

  const handleScoreChange = (criterion: string, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [criterion]: value[0],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/judgments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: params.id,
          hackathonId: submission?.hackathon.id,
          criteria: scores,
          feedback: feedback.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/judge")
      } else {
        setError(data.error || "Failed to save judgment")
      }
    } catch (error) {
      console.error("Error saving judgment:", error)
      setError("Failed to save judgment")
    } finally {
      setSaving(false)
    }
  }

  const averageScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length

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

  // Check if user has judge permissions
  if (user && user.role !== "JUDGE" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>You don't have permission to judge submissions.</AlertDescription>
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
              <Link href="/judge">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Judge Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SynapHack</span>
            </div>
          </div>
          <Badge variant="secondary">Judge</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{submission.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{submission.hackathon.title}</Badge>
                <Badge variant="secondary">Team: {submission.team.name}</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{submission.description}</p>
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
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {submission.repoUrl && (
                      <Button variant="outline" asChild>
                        <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                          Repository
                        </a>
                      </Button>
                    )}
                    {submission.videoUrl && (
                      <Button variant="outline" asChild>
                        <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer">
                          Video Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Screenshots */}
            {submission.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Screenshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Judging Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {existingJudgment ? "Update Judgment" : "Judge Submission"}
                </CardTitle>
                <CardDescription>
                  Score each criterion from 0-10 and provide feedback
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Average Score: {averageScore.toFixed(1)}/10</strong>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Scoring Criteria */}
                  <div className="space-y-6">
                    {Object.entries(JUDGING_CRITERIA).map(([key, label]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{label}</Label>
                          <Badge variant="outline">{scores[key]}/10</Badge>
                        </div>
                        <Slider
                          value={[scores[key]]}
                          onValueChange={(value) => handleScoreChange(key, value)}
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback (Optional)</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide constructive feedback for the team..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      {existingJudgment ? "Update" : "Submit"} Judgment
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/judge">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JudgeSubmissionPage() {
  return (
    <AuthGuard>
      <JudgeSubmissionContent />
    </AuthGuard>
  )
}
