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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, ArrowLeft, Loader2, Upload, X, ExternalLink, Github, Play, FileText, Presentation } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

interface Team {
  id: string
  name: string
  hackathon: {
    id: string
    title: string
    status: string
    endDate: string
  }
  submission?: {
    id: string
    title: string
    description: string
    submissionType: string
    demoUrl?: string
    repoUrl?: string
    videoUrl?: string
    presentationUrl?: string
    documentUrl?: string
    images?: string[]
    fileMetadata?: {
      presentations: Array<{
        url: string
        fileName: string
        fileSize: number
        uploadedAt: string
      }>
      documents: Array<{
        url: string
        fileName: string
        fileSize: number
        uploadedAt: string
      }>
    }
  }
}

function SubmitProjectContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [submissionType, setSubmissionType] = useState<"demo" | "presentation" | "document">("demo")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    demoUrl: "",
    repoUrl: "",
    videoUrl: "",
    presentationUrl: "",
    documentUrl: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [presentationFile, setPresentationFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [fileMetadata, setFileMetadata] = useState<{
    presentations: Array<{ url: string; fileName: string; fileSize: number; uploadedAt: string }>
    documents: Array<{ url: string; fileName: string; fileSize: number; uploadedAt: string }>
  }>({ presentations: [], documents: [] })

  const [plagiarismAnalysis, setPlagiarismAnalysis] = useState<{
    overallSimilarity: number
    uniquenessScore: number
    similarConcepts: string[]
    riskLevel: "LOW" | "MEDIUM" | "HIGH"
    suggestions: string[]
  } | null>(null)
  const [analyzingPlagiarism, setAnalyzingPlagiarism] = useState(false)

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
        if (data.submission) {
          setIsEdit(true)
          setSubmissionType(data.submission.submissionType || "demo")
          setFormData({
            title: data.submission.title,
            description: data.submission.description,
            demoUrl: data.submission.demoUrl || "",
            repoUrl: data.submission.repoUrl || "",
            videoUrl: data.submission.videoUrl || "",
            presentationUrl: data.submission.presentationUrl || "",
            documentUrl: data.submission.documentUrl || "",
          })
          setImages(data.submission.images || [])
          setFileMetadata(data.submission.fileMetadata || { presentations: [], documents: [] })
        }
      } else {
        setError(data.error || "Failed to load team")
      }
    } catch (error) {
      console.error("Error fetching team:", error)
      setError("Failed to load team")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "presentation" | "document",
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")

    try {
      if (type === "presentation" || type === "document") {
        const file = files[0]
        if (type === "presentation") {
          setPresentationFile(file)
        } else {
          setDocumentFile(file)
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Upload failed")
        }

        const fileInfo = {
          url: data.url,
          fileName: file.name,
          fileSize: file.size, // Use the actual file size from the File object
          uploadedAt: new Date().toISOString(),
        }

        if (type === "presentation") {
          setFormData((prev) => ({ ...prev, presentationUrl: data.url }))
          setFileMetadata((prev) => ({
            ...prev,
            presentations: [...prev.presentations, fileInfo],
          }))
        } else {
          setFormData((prev) => ({ ...prev, documentUrl: data.url }))
          setFileMetadata((prev) => ({
            ...prev,
            documents: [...prev.documents, fileInfo],
          }))
        }
      } else {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Upload failed")
          }

          return data.url
        })

        const uploadedUrls = await Promise.all(uploadPromises)
        setImages((prev) => [...prev, ...uploadedUrls])
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      setError(error instanceof Error ? error.message : "Failed to upload files")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeFile = (type: "presentation" | "document", index: number) => {
    if (type === "presentation") {
      setPresentationFile(null)
      setFormData((prev) => ({ ...prev, presentationUrl: "" }))
      setFileMetadata((prev) => ({
        ...prev,
        presentations: prev.presentations.filter((_, i) => i !== index),
      }))
    } else {
      setDocumentFile(null)
      setFormData((prev) => ({ ...prev, documentUrl: "" }))
      setFileMetadata((prev) => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = isEdit ? `/api/submissions/${team?.submission?.id}` : "/api/submissions"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          teamId: params.id,
          submissionType,
          images,
          fileMetadata,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/submissions/${data.id}`)
      } else {
        setError(data.error || "Failed to submit project")
      }
    } catch (error) {
      console.error("Error submitting project:", error)
      setError("Failed to submit project")
    } finally {
      setLoading(false)
    }
  }

  const analyzePlagiarism = async () => {
    if (!formData.description.trim() || !team?.hackathon.id) return

    setAnalyzingPlagiarism(true)
    try {
      const response = await fetch("/api/submissions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: formData.description,
          hackathonId: team.hackathon.id,
        }),
      })

      if (response.ok) {
        const analysis = await response.json()
        setPlagiarismAnalysis(analysis)
      }
    } catch (error) {
      console.error("Plagiarism analysis failed:", error)
    } finally {
      setAnalyzingPlagiarism(false)
    }
  }

  if (!team) {
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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/teams/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Team
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{isEdit ? "Edit" : "Submit"} Project</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update your project submission" : "Submit your project"} for{" "}
            <span className="font-medium">{team.hackathon.title}</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Team: {team.name}</Badge>
            <Badge variant={team.hackathon.status === "IN_PROGRESS" ? "default" : "secondary"}>
              {team.hackathon.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Submission</CardTitle>
            <CardDescription>Choose your submission type and provide project details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label>Submission Type</Label>
                <Tabs value={submissionType} onValueChange={(value) => setSubmissionType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="demo" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Demo & Links
                    </TabsTrigger>
                    <TabsTrigger value="presentation" className="flex items-center gap-2">
                      <Presentation className="w-4 h-4" />
                      Presentation
                    </TabsTrigger>
                    <TabsTrigger value="document" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your project title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={analyzePlagiarism}
                    disabled={analyzingPlagiarism || !formData.description.trim()}
                  >
                    {analyzingPlagiarism && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Check Uniqueness
                  </Button>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project, what it does, how you built it, challenges faced..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />

                {plagiarismAnalysis && (
                  <div className="mt-4 p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Uniqueness Analysis</h4>
                      <Badge
                        variant={
                          plagiarismAnalysis.riskLevel === "LOW"
                            ? "default"
                            : plagiarismAnalysis.riskLevel === "MEDIUM"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {plagiarismAnalysis.uniquenessScore}% Unique
                      </Badge>
                    </div>

                    {plagiarismAnalysis.similarConcepts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Similar concepts found:</p>
                        <div className="flex flex-wrap gap-1">
                          {plagiarismAnalysis.similarConcepts.map((concept, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {plagiarismAnalysis.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Suggestions to improve uniqueness:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {plagiarismAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Tabs value={submissionType} className="space-y-6">
                <TabsContent value="demo" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="demoUrl">Demo URL</Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="demoUrl"
                          name="demoUrl"
                          type="url"
                          placeholder="https://your-demo.com"
                          value={formData.demoUrl}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repoUrl">Repository URL</Label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="repoUrl"
                          name="repoUrl"
                          type="url"
                          placeholder="https://github.com/username/repo"
                          value={formData.repoUrl}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video Demo URL</Label>
                    <div className="relative">
                      <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={formData.videoUrl}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Project Screenshots</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload screenshots of your project (max 10MB per file)
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, "image")}
                          disabled={uploading}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="presentation" className="space-y-6">
                  <div className="space-y-4">
                    <Label>Upload Presentation</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Presentation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload your presentation (PPT, PPTX, PDF - max 50MB)
                        </p>
                        <Input
                          type="file"
                          accept=".ppt,.pptx,.pdf"
                          onChange={(e) => handleFileUpload(e, "presentation")}
                          disabled={uploading}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    {fileMetadata.presentations.length > 0 && (
                      <div className="space-y-2">
                        {fileMetadata.presentations.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Presentation className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <span className="text-sm font-medium">{file.fileName}</span>
                                <p className="text-xs text-muted-foreground">
                                  {file.fileSize ? (file.fileSize / (1024 * 1024)).toFixed(1) : "0.0"} MB • Uploaded{" "}
                                  {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("presentation", index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="document" className="space-y-6">
                  <div className="space-y-4">
                    <Label>Upload Document</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload your project document (PDF, DOC, DOCX - max 25MB)
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, "document")}
                          disabled={uploading}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    {fileMetadata.documents.length > 0 && (
                      <div className="space-y-2">
                        {fileMetadata.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <span className="text-sm font-medium">{file.fileName}</span>
                                <p className="text-xs text-muted-foreground">
                                  {file.fileSize ? (file.fileSize / (1024 * 1024)).toFixed(1) : "0.0"} MB • Uploaded{" "}
                                  {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("document", index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Uploading files...</span>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || uploading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEdit ? "Update Submission" : "Submit Project"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/teams/${params.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SubmitProjectPage() {
  return (
    <AuthGuard>
      <SubmitProjectContent />
    </AuthGuard>
  )
}
