"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, Calendar, Users, Trophy, Search, Plus, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface Hackathon {
  id: string
  title: string
  description: string
  theme?: string
  startDate: string
  endDate: string
  status: string
  maxTeamSize: number
  bannerImage?: string
  organizer: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  _count: {
    participations: number
    teams: number
    submissions: number
  }
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchHackathons()
  }, [statusFilter])

  const fetchHackathons = async () => {
    try {
      console.log("[v0] Fetching hackathons from client...")
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/hackathons?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("[v0] Received data:", data)

      if (data.error) {
        throw new Error(data.message || data.error)
      }

      setHackathons(data.hackathons || [])
    } catch (error) {
      console.error("[v0] Error fetching hackathons:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch hackathons")
      setHackathons([])
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

  const filteredHackathons = hackathons.filter(
    (hackathon) =>
      hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.theme?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SynapHack</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (user.role === "ORGANIZER" || user.role === "ADMIN") && (
              <Button asChild>
                <Link href="/hackathons/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Hackathon
                </Link>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Hackathons</h1>
          <p className="text-muted-foreground">Find exciting hackathons to participate in and showcase your skills</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="JUDGING">Judging</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hackathons Grid */}
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
        ) : error ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Hackathons</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchHackathons} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hackathons found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Check back later for new hackathons"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => (
              <Card key={hackathon.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/hackathons/${hackathon.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(hackathon.status)} variant="secondary">
                        {hackathon.status.replace("_", " ")}
                      </Badge>
                      {hackathon.theme && (
                        <Badge variant="outline" className="text-xs">
                          {hackathon.theme}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{hackathon.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{hackathon.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(hackathon.startDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(hackathon.endDate), "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{hackathon._count.participations} participants</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Max team size: {hackathon.maxTeamSize}</span>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Organized by {hackathon.organizer.firstName} {hackathon.organizer.lastName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
