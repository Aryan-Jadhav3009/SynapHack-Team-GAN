"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Code2,
  Calendar,
  Users,
  Trophy,
  Clock,
  UserPlus,
  UserMinus,
  Edit,
  ArrowLeft,
  CheckCircle,
  Circle,
  Play,
  Flag,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { format, addDays, subDays, isBefore } from "date-fns"

interface HackathonDetail {
  id: string
  title: string
  description: string
  theme?: string
  startDate: string
  endDate: string
  status: string
  maxTeamSize: number
  prizes?: any
  rules?: string
  bannerImage?: string
  organizer: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  _count: {
    participations: number
    teams: number
    submissions: number
  }
}

interface UserTeam {
  id: string
  name: string
  description?: string
  memberCount: number
  isLeader: boolean
}

const ProgressTimeline = ({ hackathon }: { hackathon: HackathonDetail }) => {
  const now = new Date()
  const startDate = new Date(hackathon.startDate)
  const endDate = new Date(hackathon.endDate)

  const registrationStart = subDays(startDate, 14) // 2 weeks before hackathon starts
  const judgingStart = endDate // Judging starts when hackathon ends
  const resultsDate = addDays(endDate, 7) // Results announced 1 week after hackathon ends

  const stages = [
    {
      key: "UPCOMING",
      label: "Registration Opens",
      icon: Circle,
      date: registrationStart,
      description: "Registration period begins",
      status: hackathon.status,
    },
    {
      key: "REGISTRATION_OPEN",
      label: "Hackathon Begins",
      icon: Play,
      date: startDate,
      description: "Development phase starts",
      status: hackathon.status,
    },
    {
      key: "IN_PROGRESS",
      label: "Development Phase",
      icon: Code2,
      date: startDate,
      description: "Teams building their projects",
      status: hackathon.status,
    },
    {
      key: "JUDGING",
      label: "Judging Phase",
      icon: Trophy,
      date: judgingStart,
      description: "Submissions being evaluated",
      status: hackathon.status,
    },
    {
      key: "COMPLETED",
      label: "Results Announced",
      icon: Flag,
      date: resultsDate,
      description: "Winners revealed",
      status: hackathon.status,
    },
  ]

  const getCurrentStageIndex = () => {
    if (isBefore(now, registrationStart)) return -1
    if (isBefore(now, startDate)) return 0
    if (isBefore(now, endDate)) return 2
    if (isBefore(now, resultsDate)) return 3
    return 4
  }

  const currentStageIndex = getCurrentStageIndex()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isCompleted = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isUpcoming = index > currentStageIndex

            return (
              <div key={stage.key} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      : isCurrent
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                      {isCurrent && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Current stage</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {format(stage.date, "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(stage.date, "h:mm a")}</p>
                    </div>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`w-px h-8 ml-4 ${
                      isCompleted ? "bg-green-200 dark:bg-green-800" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function HackathonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
  const [teamRequired, setTeamRequired] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchHackathon()
      checkRegistration()
      if (user) {
        checkUserTeam()
      }
    }
  }, [params.id, user])

  const checkUserTeam = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/hackathons/${params.id}/user-team`)
      if (response.ok) {
        const data = await response.json()
        setUserTeam(data.team)
      }
    } catch (error) {
      console.error("Error checking user team:", error)
    }
  }

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setHackathon(data)
        setTeamRequired(data.maxTeamSize > 1)
      } else {
        setError(data.error || "Failed to load hackathon")
      }
    } catch (error) {
      console.error("Error fetching hackathon:", error)
      setError("Failed to load hackathon")
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/hackathons/${params.id}/check-registration`)
      if (response.ok) {
        const data = await response.json()
        setIsRegistered(data.isRegistered)
      }
    } catch (error) {
      console.error("Error checking registration:", error)
    }
  }

  const handleRegistration = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setRegistering(true)
    setError("")

    try {
      const method = isRegistered ? "DELETE" : "POST"
      const response = await fetch(`/api/hackathons/${params.id}/register`, {
        method,
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(!isRegistered)
        fetchHackathon()
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed")
    } finally {
      setRegistering(false)
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

  const canRegister = hackathon?.status === "REGISTRATION_OPEN" || hackathon?.status === "UPCOMING"
  const isOrganizer = user && hackathon && user.id === hackathon.organizer.id
  const canManageTeams =
    hackathon?.status === "REGISTRATION_OPEN" || hackathon?.status === "UPCOMING" || hackathon?.status === "IN_PROGRESS"
  const needsTeam = isRegistered && teamRequired && !userTeam && canManageTeams

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

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Hackathon not found"}</AlertDescription>
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
              <Link href="/hackathons">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
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
            {isOrganizer && (
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {user ? (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(hackathon.status)} variant="secondary">
                    {hackathon.status.replace("_", " ")}
                  </Badge>
                  {hackathon.theme && <Badge variant="outline">{hackathon.theme}</Badge>}
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">{hackathon.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{hackathon.description}</p>
            </div>

            {/* Progress Timeline */}
            <ProgressTimeline hackathon={hackathon} />

            {/* Team Requirement Alert */}
            {needsTeam && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  This hackathon requires teams of up to {hackathon.maxTeamSize} members. You need to create or join a
                  team to participate.
                </AlertDescription>
              </Alert>
            )}

            {/* Team Management Section */}
            {isRegistered && canManageTeams && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userTeam ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{userTeam.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {userTeam.memberCount} / {hackathon.maxTeamSize} members
                            {userTeam.isLeader && " • You are the team leader"}
                          </p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/teams/${userTeam.id}`}>Manage Team</Link>
                        </Button>
                      </div>
                      {userTeam.description && <p className="text-sm text-muted-foreground">{userTeam.description}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {teamRequired
                          ? "You need to create or join a team to participate in this hackathon."
                          : "You can work solo or create/join a team for this hackathon."}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href={`/hackathons/${params.id}/teams/create`}>Create Team</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${params.id}/teams`}>Browse Teams</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(hackathon.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ends {format(new Date(hackathon.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{hackathon._count.participations} participants registered</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum team size: {hackathon.maxTeamSize}
                      {teamRequired && " (Team required)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{hackathon._count.teams} teams formed</p>
                    <p className="text-sm text-muted-foreground">{hackathon._count.submissions} submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            {hackathon.rules && (
              <Card>
                <CardHeader>
                  <CardTitle>Rules & Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p>{hackathon.rules}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prizes */}
            {hackathon.prizes && (
              <Card>
                <CardHeader>
                  <CardTitle>Prizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p>Prize information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Sign in to register for this hackathon</p>
                    <Button className="w-full" asChild>
                      <Link href="/auth/login">Sign In to Register</Link>
                    </Button>
                  </div>
                ) : canRegister ? (
                  <Button
                    className="w-full"
                    onClick={handleRegistration}
                    disabled={registering}
                    variant={isRegistered ? "destructive" : "default"}
                  >
                    {registering ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : isRegistered ? (
                      <UserMinus className="w-4 h-4 mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {registering ? "Processing..." : isRegistered ? "Unregister" : "Register Now"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Registration is not currently open for this hackathon
                    </p>
                    <Button className="w-full" disabled>
                      Registration Closed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Actions */}
            {isRegistered && canManageTeams && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-transparent" variant="outline" asChild>
                    <Link href={`/hackathons/${params.id}/teams`}>
                      <Users className="w-4 h-4 mr-2" />
                      View All Teams
                    </Link>
                  </Button>
                  {!userTeam && (
                    <Button className="w-full" asChild>
                      <Link href={`/hackathons/${params.id}/teams/create`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create New Team
                      </Link>
                    </Button>
                  )}
                  {userTeam && (
                    <Button className="w-full bg-transparent" variant="outline" asChild>
                      <Link href={`/teams/${userTeam.id}/invite`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Members
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={hackathon.organizer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {hackathon.organizer.firstName[0]}
                      {hackathon.organizer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {hackathon.organizer.firstName} {hackathon.organizer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">@{hackathon.organizer.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Participants</span>
                  <span className="font-medium">{hackathon._count.participations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Teams</span>
                  <span className="font-medium">{hackathon._count.teams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submissions</span>
                  <span className="font-medium">{hackathon._count.submissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Team Size</span>
                  <span className="font-medium">{hackathon.maxTeamSize}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
