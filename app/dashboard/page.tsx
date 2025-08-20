"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code2, Calendar, Users, Trophy, LogOut, Plus, Settings, User, Activity, TrendingUp, Clock } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { azureSignalRService } from "@/lib/azure-signalr"

interface ActivityItem {
  id: string
  type: string
  message: string
  user: {
    firstName: string
    lastName: string
    avatar?: string
  }
  createdAt: string
  metadata: any
}

interface DashboardStats {
  activeHackathons: number
  teamsJoined: number
  submissions: number
  rank: number
}

interface LiveMetrics {
  onlineUsers: number
  activeTeams: number
  recentSubmissions: number
  liveEvents: number
  lastUpdated: string
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null)
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  const fetchLiveMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/live-metrics")
      const data = await response.json()
      if (response.ok) {
        setLiveMetrics(data.metrics)
      }
    } catch (error) {
      console.error("Error fetching live metrics:", error)
    }
  }, [])

  useEffect(() => {
    fetchRecentActivities()
    fetchDashboardStats()
    fetchLiveMetrics()

    if (user?.id) {
      azureSignalRService.connect(user.id).then(() => {
        setIsConnected(true)
        console.log("[v0] Connected to live metrics service")
      })

      // Setup real-time event listeners
      azureSignalRService.onHackathonUpdate((hackathonId, update) => {
        console.log("[v0] Received hackathon update:", { hackathonId, update })
        fetchDashboardStats()
        fetchLiveMetrics()
      })

      azureSignalRService.onTeamUpdate((teamId, update) => {
        console.log("[v0] Received team update:", { teamId, update })
        fetchDashboardStats()
        fetchLiveMetrics()
      })
    }

    const metricsInterval = setInterval(fetchLiveMetrics, 30000)
    const statsInterval = setInterval(fetchDashboardStats, 60000)

    return () => {
      clearInterval(metricsInterval)
      clearInterval(statsInterval)
      azureSignalRService.disconnect()
    }
  }, [user?.id, fetchLiveMetrics])

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("/api/activities?limit=5")
      const data = await response.json()
      if (response.ok) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = async () => {
    console.log("[v0] Logout button clicked")
    await logout()
    router.push("/")
  }

  const handleNavigation = (path: string, label: string) => {
    console.log(`[v0] Navigation clicked: ${label} -> ${path}`)
    router.push(path)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "hackathon_created":
        return <Calendar className="w-4 h-4 text-blue-500" />
      case "team_created":
        return <Users className="w-4 h-4 text-green-500" />
      case "submission_created":
        return <Code2 className="w-4 h-4 text-purple-500" />
      case "user_registered":
        return <User className="w-4 h-4 text-orange-500" />
      case "hackathon_started":
        return <Trophy className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
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
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-xs text-muted-foreground">{isConnected ? "Live" : "Offline"}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome back, </span>
              <span className="font-medium">{user?.firstName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation("/profile", "Profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">
            Ready to build something amazing? Here's what's happening in your hackathon world.
          </p>
        </div>

        {liveMetrics && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Platform Metrics
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Last updated: {new Date(liveMetrics.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Online Users</p>
                      <p className="text-2xl font-bold text-green-600">{liveMetrics.onlineUsers}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Teams</p>
                      <p className="text-2xl font-bold text-blue-600">{liveMetrics.activeTeams}</p>
                    </div>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recent Submissions</p>
                      <p className="text-2xl font-bold text-purple-600">{liveMetrics.recentSubmissions}</p>
                    </div>
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Live Events</p>
                      <p className="text-2xl font-bold text-orange-600">{liveMetrics.liveEvents}</p>
                    </div>
                    <Activity className="w-5 h-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => handleNavigation("/hackathons", "Browse Hackathons")}>
            <Calendar className="w-4 h-4 mr-2" />
            Browse Hackathons
          </Button>
          <Button variant="outline" onClick={() => handleNavigation("/find-teammates", "Find Teammates")}>
            <Users className="w-4 h-4 mr-2" />
            Find Teammates
          </Button>
          {user?.role === "ORGANIZER" && (
            <Button variant="outline" onClick={() => handleNavigation("/hackathons/create", "Create Hackathon")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Hackathon
            </Button>
          )}
          {user?.role === "ORGANIZER" && (
            <Button variant="outline" onClick={() => handleNavigation("/organizer", "Organizer Dashboard")}>
              <Settings className="w-4 h-4 mr-2" />
              Organizer Dashboard
            </Button>
          )}
          {user?.role === "ADMIN" && (
            <Button variant="outline" onClick={() => handleNavigation("/admin", "Admin Dashboard")}>
              <Settings className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Button>
          )}
          {user?.role === "JUDGE" && (
            <Button variant="outline" onClick={() => handleNavigation("/judge", "Judge Dashboard")}>
              <Trophy className="w-4 h-4 mr-2" />
              Judge Dashboard
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Hackathons</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-8 mb-1" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.activeHackathons || 0}</div>
                      <p className="text-xs text-muted-foreground">Currently registered</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Teams Joined</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-8 mb-1" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.teamsJoined || 0}</div>
                      <p className="text-xs text-muted-foreground">Active memberships</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-8 mb-1" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.submissions || 0}</div>
                      <p className="text-xs text-muted-foreground">Projects submitted</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-12 mb-1" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">#{stats?.rank || "N/A"}</div>
                      <p className="text-xs text-muted-foreground">Global leaderboard</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow h-full"
                onClick={() => handleNavigation("/hackathons", "Browse Hackathons Card")}
              >
                <CardHeader>
                  <Calendar className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Browse Hackathons</CardTitle>
                  <CardDescription>Discover upcoming hackathons and register to participate</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Explore events</Badge>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow h-full"
                onClick={() => handleNavigation("/find-teammates", "Find Teammates Card")}
              >
                <CardHeader>
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Find Teammates</CardTitle>
                  <CardDescription>Connect with talented individuals and join teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Build your team</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest happenings on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-muted rounded w-3/4" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {activity.user.firstName[0]}
                            {activity.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getActivityIcon(activity.type)}
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            <span className="font-medium">
                              {activity.user.firstName} {activity.user.lastName}
                            </span>{" "}
                            {activity.message
                              .replace(activity.user.firstName + " " + activity.user.lastName, "")
                              .trim()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation("/profile", "My Profile Card")}
            >
              <CardHeader>
                <User className="w-8 h-8 text-primary mb-2" />
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your profile, skills, and social links</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Complete your profile</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
