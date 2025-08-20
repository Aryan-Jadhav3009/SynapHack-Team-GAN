"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code2, Users, Search, Plus, UserPlus, Crown, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface TeamMember {
  id: string
  role: string
  status: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    skills: string[]
  }
}

interface Team {
  id: string
  name: string
  description?: string
  members: TeamMember[]
  hackathon: {
    maxTeamSize: number
  }
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function HackathonTeamsPage() {
  const params = useParams()
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchHackathon()
      fetchTeams()
    }
  }, [params.id, showOnlyAvailable])

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

  const fetchTeams = async () => {
    try {
      const queryParams = new URLSearchParams({
        hackathonId: params.id as string,
        ...(showOnlyAvailable && { lookingForMembers: "true" }),
      })

      const response = await fetch(`/api/teams?${queryParams}`)
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams)
      } else {
        setError(data.error || "Failed to load teams")
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setError("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/teams/${teamId}/join`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        fetchTeams() // Refresh teams list
      } else {
        setError(data.error || "Failed to join team")
      }
    } catch (error) {
      console.error("Error joining team:", error)
      setError("Failed to join team")
    }
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.members.some((member) =>
        `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  const userTeam = teams.find((team) => team.members.some((member) => member.user.id === user?.id))

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
          <div className="flex items-center gap-4">
            {user && !userTeam && (
              <Button asChild>
                <Link href={`/hackathons/${params.id}/teams/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">
            {hackathon ? `Find and join teams for ${hackathon.title}` : "Find and join teams for this hackathon"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {userTeam && (
          <Alert className="mb-6">
            <AlertDescription>
              You are already in team "{userTeam.name}".{" "}
              <Link href={`/teams/${userTeam.id}`} className="underline">
                View your team
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showOnlyAvailable ? "default" : "outline"}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
          >
            {showOnlyAvailable ? "Show All Teams" : "Looking for Members"}
          </Button>
        </div>

        {/* Teams Grid */}
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
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to create a team!"}
            </p>
            {user && !userTeam && (
              <Button asChild>
                <Link href={`/hackathons/${params.id}/teams/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const hasSpace = team.members.length < team.hackathon.maxTeamSize
              const isUserInTeam = team.members.some((member) => member.user.id === user?.id)

              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                      <Badge variant={hasSpace ? "default" : "secondary"}>
                        {team.members.length}/{team.hackathon.maxTeamSize}
                      </Badge>
                    </div>
                    {team.description && <CardDescription className="line-clamp-2">{team.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Team Members */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Members</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member) => (
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
                                {member.role === "LEADER" && <Crown className="w-3 h-3 inline ml-1" />}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      {team.members.some((member) => member.user.skills && member.user.skills.length > 0) && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(
                              new Set(team.members.flatMap((member) => member.user.skills || []).slice(0, 6)),
                            ).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                          <Link href={`/teams/${team.id}`}>View Team</Link>
                        </Button>
                        {user && !isUserInTeam && !userTeam && hasSpace && (
                          <Button size="sm" onClick={() => handleJoinTeam(team.id)}>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )}
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
