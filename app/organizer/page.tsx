"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Code2,
  Calendar,
  Users,
  Trophy,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Target,
  Megaphone,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OrganizerHackathon {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
  _count: {
    participations: number
    teams: number
    submissions: number
  }
}

interface OrganizerStats {
  totalHackathons: number
  totalParticipants: number
  totalTeams: number
  totalSubmissions: number
  activeHackathons: number
}

function OrganizerDashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<OrganizerHackathon[]>([])
  const [stats, setStats] = useState<OrganizerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.role !== "ORGANIZER") {
      router.push("/dashboard")
      return
    }
    fetchOrganizerData()
  }, [user, router])

  const fetchOrganizerData = async () => {
    try {
      // Fetch organizer hackathons
      const hackathonsResponse = await fetch("/api/organizer/hackathons")
      const hackathonsData = await hackathonsResponse.json()

      if (hackathonsResponse.ok) {
        setHackathons(hackathonsData.hackathons)
      }

      // Fetch organizer stats
      const statsResponse = await fetch("/api/organizer/stats")
      const statsData = await statsResponse.json()

      if (statsResponse.ok) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error fetching organizer data:", error)
      setError("Failed to load organizer data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "REGISTRATION_OPEN":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "JUDGING":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (user?.role !== "ORGANIZER") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Alert>
          <AlertDescription>Access denied. This page is only available to organizers.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SynapHack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Organizer</Badge>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage your hackathons and engage with participants</p>
          </div>
          <Button asChild>
            <Link href="/hackathons/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Hackathon
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Hackathons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHackathons}</div>
                <p className="text-xs text-muted-foreground">Events organized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeHackathons}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                <p className="text-xs text-muted-foreground">Across all events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teams Formed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTeams}</div>
                <p className="text-xs text-muted-foreground">Total teams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">Projects submitted</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="hackathons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hackathons">My Hackathons</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="hackathons" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Hackathons</h2>
              <Button variant="outline" asChild>
                <Link href="/hackathons/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Hackathon
                </Link>
              </Button>
            </div>

            {hackathons.length > 0 ? (
              <div className="grid gap-6">
                {hackathons.map((hackathon) => (
                  <Card key={hackathon.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                            <Badge className={getStatusColor(hackathon.status)} variant="secondary">
                              {hackathon.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardDescription className="max-w-2xl">{hackathon.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/hackathons/${hackathon.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">{hackathon._count.participations}</span> participants
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">{hackathon._count.teams}</span> teams
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">{hackathon._count.submissions}</span> submissions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(hackathon.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hackathons yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first hackathon to get started</p>
                  <Button asChild>
                    <Link href="/hackathons/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Hackathon
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participation Trends</CardTitle>
                  <CardDescription>Track participant engagement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mr-2" />
                    Analytics charts will be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submission Quality</CardTitle>
                  <CardDescription>Average scores and feedback metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <Trophy className="w-8 h-8 mr-2" />
                    Quality metrics will be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <h2 className="text-2xl font-bold">Participant Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Participants</CardTitle>
                <CardDescription>Manage participants across all your hackathons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U{i + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Participant {i + 1}</p>
                          <p className="text-sm text-muted-foreground">participant{i + 1}@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Active</Badge>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Announcements</h2>
              <Button>
                <Megaphone className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Communicate with participants across your hackathons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Announcement {i + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Published</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        This is a sample announcement for hackathon participants...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Posted 2 hours ago</span>
                        <span>•</span>
                        <span>AI Innovation Challenge</span>
                        <span>•</span>
                        <span>156 views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function OrganizerDashboardPage() {
  return (
    <AuthGuard>
      <OrganizerDashboardContent />
    </AuthGuard>
  )
}
