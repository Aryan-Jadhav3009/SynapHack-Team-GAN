"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Registration {
  id: string
  registeredAt: string
  user: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role: string
    skills: string[]
    avatar?: string
    createdAt: string
  }
  hackathon: {
    id: string
    title: string
    status: string
  }
}

function RegistrationsContent() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHackathon, setSelectedHackathon] = useState("")

  useEffect(() => {
    fetchRegistrations()
  }, [selectedHackathon])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedHackathon) params.append("hackathonId", selectedHackathon)

      const response = await fetch(`/api/admin/registrations?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRegistrations(data.registrations)
      } else {
        setError(data.error || "Failed to fetch registrations")
      }
    } catch (error) {
      setError("Failed to fetch registrations")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: "json" | "csv") => {
    try {
      const params = new URLSearchParams()
      if (selectedHackathon) params.append("hackathonId", selectedHackathon)
      params.append("format", format)

      const response = await fetch(`/api/admin/export?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `registrations.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        setError(data.error || "Export failed")
      }
    } catch (error) {
      setError("Export failed")
    }
  }

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (user && user.role !== "ADMIN" && user.role !== "ORGANIZER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to view registration data.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Registrations</h1>
        <p className="text-muted-foreground">View and export hackathon registration data</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Button onClick={() => exportData("csv")} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={() => exportData("json")} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registrations ({filteredRegistrations.length})
          </CardTitle>
          <CardDescription>All user registrations across hackathons</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading registrations...</div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={registration.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {registration.user.firstName[0]}
                        {registration.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {registration.user.firstName} {registration.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {registration.user.email} • @{registration.user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{registration.user.role}</Badge>
                    <div className="text-sm text-muted-foreground mt-1">{registration.hackathon.title}</div>
                  </div>
                </div>
              ))}
              {filteredRegistrations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No registrations found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegistrationsPage() {
  return (
    <AuthGuard>
      <RegistrationsContent />
    </AuthGuard>
  )
}
