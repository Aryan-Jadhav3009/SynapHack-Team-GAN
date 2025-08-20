import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code2, Users, Trophy, Zap, Calendar, Target, Activity } from "lucide-react"
import Link from "next/link"

async function getRecentActivities() {
  try {
    // In a real app, this would be a server-side fetch
    // For now, return mock data
    return [
      {
        id: "1",
        type: "hackathon_created",
        message: "AI Innovation Challenge 2024 was created",
        user: { firstName: "Sarah", lastName: "Chen", avatar: null },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        type: "team_created",
        message: "Team 'Code Warriors' was formed",
        user: { firstName: "Alex", lastName: "Johnson", avatar: null },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "submission_created",
        message: "Project 'EcoTracker' was submitted",
        user: { firstName: "David", lastName: "Kim", avatar: null },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ]
  } catch (error) {
    return []
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "hackathon_created":
      return <Calendar className="w-4 h-4 text-blue-500" />
    case "team_created":
      return <Users className="w-4 h-4 text-green-500" />
    case "submission_created":
      return <Code2 className="w-4 h-4 text-purple-500" />
    default:
      return <Activity className="w-4 h-4 text-gray-500" />
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export default async function HomePage() {
  const recentActivities = await getRecentActivities()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SynapHack</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hackathons" className="text-muted-foreground hover:text-foreground transition-colors">
              Hackathons
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Powered by Innovation
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Build the Future at
            <span className="text-primary"> SynapHack</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The ultimate platform for organizing and participating in hackathons. Connect with innovators, build amazing
            projects, and compete for incredible prizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/hackathons">
                <Calendar className="w-4 h-4 mr-2" />
                Browse Hackathons
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/hackathons/create">
                <Target className="w-4 h-4 mr-2" />
                Organize Event
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features and Activity Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Features */}
            <div className="lg:col-span-3">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  From registration to judging, we've got every aspect of hackathon management covered.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <Users className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Team Formation</CardTitle>
                    <CardDescription>
                      Find teammates with complementary skills and form the perfect team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Skill-based matching</li>
                      <li>• Team chat integration</li>
                      <li>• Role management</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Code2 className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Project Submission</CardTitle>
                    <CardDescription>Submit your projects with demos, code, and documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• GitHub integration</li>
                      <li>• Video demos</li>
                      <li>• Live deployment links</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Trophy className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Judging System</CardTitle>
                    <CardDescription>Fair and transparent judging with detailed feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Multi-criteria scoring</li>
                      <li>• Judge feedback</li>
                      <li>• Real-time results</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Activity
                  </CardTitle>
                  <CardDescription>See what's happening right now</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={activity.user.avatar || undefined} />
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Hacking?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers, designers, and innovators building the next big thing.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Join SynapHack Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 SynapHack. Built for innovators, by innovators.</p>
        </div>
      </footer>
    </div>
  )
}
