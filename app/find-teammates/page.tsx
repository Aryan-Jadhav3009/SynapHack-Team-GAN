"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Users, Search, Filter, MessageSquare, Github, Linkedin, MapPin, Star, UserPlus } from "lucide-react"
import Link from "next/link"

interface Teammate {
  id: string
  firstName: string
  lastName: string
  username: string
  avatar?: string
  bio?: string
  skills: string[]
  location?: string
  githubUrl?: string
  linkedinUrl?: string
  websiteUrl?: string
  lookingForTeam: boolean
  preferredRoles: string[]
  hackathonExperience: number
  matchScore?: number
}

interface Team {
  id: string
  name: string
  description?: string
  hackathonTitle: string
  requiredSkills: string[]
  lookingForRoles: string[]
  memberCount: number
  maxMembers: number
  members: Array<{
    user: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }>
}

function FindTeammatesContent() {
  const { user } = useAuth()
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("teammates")

  useEffect(() => {
    fetchTeammates()
    fetchTeams()
  }, [])

  const fetchTeammates = async () => {
    try {
      const response = await fetch("/api/find-teammates")
      const data = await response.json()
      if (response.ok) {
        setTeammates(data.teammates)
      }
    } catch (error) {
      console.error("Error fetching teammates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/find-teams")
      const data = await response.json()
      if (response.ok) {
        setTeams(data.teams)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const filteredTeammates = teammates.filter((teammate) => {
    const matchesSearch =
      teammate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teammate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teammate.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSkill = skillFilter === "all" || teammate.skills.includes(skillFilter)

    const matchesExperience =
      experienceFilter === "all" ||
      (experienceFilter === "beginner" && teammate.hackathonExperience <= 2) ||
      (experienceFilter === "intermediate" && teammate.hackathonExperience > 2 && teammate.hackathonExperience <= 5) ||
      (experienceFilter === "expert" && teammate.hackathonExperience > 5)

    return matchesSearch && matchesSkill && matchesExperience
  })

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.hackathonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.requiredSkills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSkill = skillFilter === "all" || team.requiredSkills.includes(skillFilter)

    return matchesSearch && matchesSkill
  })

  const allSkills = Array.from(
    new Set([
      ...teammates.flatMap((t) => t.skills),
      ...teams.flatMap((t) => t.requiredSkills),
      "React",
      "Node.js",
      "Python",
      "TypeScript",
      "UI/UX Design",
      "Machine Learning",
      "Blockchain",
      "Mobile Development",
    ]),
  )

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
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Teammates</h1>
          <p className="text-muted-foreground">
            Connect with talented individuals and join teams based on complementary skills
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, skills, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill.toLowerCase()}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner (0-2 hackathons)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (3-5 hackathons)</SelectItem>
                  <SelectItem value="expert">Expert (5+ hackathons)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teammates">Find Teammates</TabsTrigger>
            <TabsTrigger value="teams">Join Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="teammates" className="space-y-6">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTeammates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeammates.map((teammate) => (
                  <Card key={teammate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={teammate.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {teammate.firstName[0]}
                              {teammate.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {teammate.firstName} {teammate.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">@{teammate.username}</p>
                            {teammate.matchScore && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">{teammate.matchScore}% match</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {teammate.lookingForTeam && (
                          <Badge variant="secondary" className="text-xs">
                            Looking for team
                          </Badge>
                        )}
                      </div>

                      {teammate.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{teammate.bio}</p>
                      )}

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {teammate.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {teammate.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{teammate.skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {teammate.preferredRoles.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Preferred Roles</p>
                            <div className="flex flex-wrap gap-1">
                              {teammate.preferredRoles.slice(0, 2).map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {teammate.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{teammate.location}</span>
                              </div>
                            )}
                            <span>{teammate.hackathonExperience} hackathons</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {teammate.githubUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={teammate.githubUrl} target="_blank">
                                  <Github className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                            {teammate.linkedinUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={teammate.linkedinUrl} target="_blank">
                                  <Linkedin className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                            <Button size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teammates found</h3>
                  <p className="text-muted-foreground">Try adjusting your search filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            {filteredTeams.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">{team.hackathonTitle}</p>
                        </div>
                        <Badge variant="outline">
                          {team.memberCount}/{team.maxMembers} members
                        </Badge>
                      </div>

                      {team.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{team.description}</p>
                      )}

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {team.requiredSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {team.lookingForRoles.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Looking For</p>
                            <div className="flex flex-wrap gap-1">
                              {team.lookingForRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 3).map((member, index) => (
                              <Avatar key={index} className="w-6 h-6 border-2 border-background">
                                <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {member.user.firstName[0]}
                                  {member.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {team.members.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium">+{team.members.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <Button size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Request to Join
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                  <p className="text-muted-foreground">Try adjusting your search filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function FindTeammatesPage() {
  return (
    <AuthGuard>
      <FindTeammatesContent />
    </AuthGuard>
  )
}
