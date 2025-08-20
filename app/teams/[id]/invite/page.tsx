"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Copy, Check, Loader2 } from "lucide-react"

export default function TeamInvitePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTeam()
  }, [params.id])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}`)
      if (!response.ok) throw new Error("Team not found")

      const { team } = await response.json()
      setTeam(team)
    } catch (err) {
      setError("Team not found or invite link is invalid")
    } finally {
      setLoading(false)
    }
  }

  const joinTeam = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setJoining(true)
    try {
      const response = await fetch(`/api/teams/${params.id}/join`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to join team")

      router.push(`/teams/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team")
    } finally {
      setJoining(false)
    }
  }

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/teams/${params.id}/invite`
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>{error || "Team not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <UserPlus className="w-8 h-8" />
          Join Team
        </h1>
        <p className="text-muted-foreground">You've been invited to join a team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {team.name}
          </CardTitle>
          <CardDescription>
            {team.currentMembers || 1} / {team.maxMembers} members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{team.description}</p>
          </div>

          {team.skills && team.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {team.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {user ? (
              <Button onClick={joinTeam} disabled={joining} className="flex-1">
                {joining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Join Team
              </Button>
            ) : (
              <Button onClick={() => router.push("/auth/login")} className="flex-1">
                Login to Join
              </Button>
            )}

            <Button variant="outline" onClick={copyInviteLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
