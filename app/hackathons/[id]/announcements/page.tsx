"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Code2,
  ArrowLeft,
  Megaphone,
  Plus,
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface Announcement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "success" | "urgent"
  author: {
    firstName: string
    lastName: string
    avatar?: string
  }
  createdAt: string
  views: number
  pinned: boolean
}

interface Hackathon {
  id: string
  title: string
  organizer: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function AnnouncementsPage() {
  const params = useParams()
  const { user } = useAuth()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info" as const,
    pinned: false,
  })

  useEffect(() => {
    if (params.id) {
      fetchHackathon()
      fetchAnnouncements()
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

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/announcements`)
      const data = await response.json()
      if (response.ok) {
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setNewAnnouncement({ title: "", content: "", type: "info", pinned: false })
        fetchAnnouncements()
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
    }
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
    }
  }

  const isOrganizer = user && hackathon && user.id === hackathon.organizer.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Announcements</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest news for <span className="font-medium">{hackathon?.title}</span>
            </p>
          </div>
          {isOrganizer && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>Share important updates with all participants</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your announcement..."
                      rows={4}
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={!newAnnouncement.title || !newAnnouncement.content}
                    >
                      Create Announcement
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`${getAnnouncementColor(announcement.type)} ${
                  announcement.pinned ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAnnouncementIcon(announcement.type)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          {announcement.pinned && <Badge variant="secondary">Pinned</Badge>}
                          <Badge variant="outline" className="capitalize">
                            {announcement.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={announcement.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {announcement.author.firstName[0]}
                                {announcement.author.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {announcement.author.firstName} {announcement.author.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(announcement.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{announcement.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {isOrganizer && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                <p className="text-muted-foreground">
                  {isOrganizer
                    ? "Create your first announcement to keep participants informed"
                    : "Check back later for updates from the organizers"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
