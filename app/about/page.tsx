import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Users, Target, Zap, Heart } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
            <Link href="/about" className="text-foreground font-medium">
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

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About SynapHack</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're building the future of hackathon experiences, connecting innovators worldwide to create, collaborate,
            and compete.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              SynapHack was born from the belief that great ideas emerge when brilliant minds collaborate. We've
              experienced firsthand the magic that happens during hackathons - the late-night coding sessions, the
              eureka moments, and the friendships forged through shared challenges.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform removes the friction from hackathon participation, letting you focus on what matters most:
              building something incredible.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <Target className="w-24 h-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Community First</CardTitle>
                <CardDescription>Building connections that last beyond the hackathon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We believe the best innovations come from diverse teams working together. Our platform prioritizes
                  meaningful connections and collaborative growth.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Innovation</CardTitle>
                <CardDescription>Pushing boundaries and exploring new possibilities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every hackathon is an opportunity to solve real problems with creative solutions. We provide the tools
                  and environment for breakthrough moments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Inclusivity</CardTitle>
                <CardDescription>Welcoming hackers of all backgrounds and skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From first-time participants to seasoned developers, everyone has something valuable to contribute. We
                  celebrate diversity in all its forms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">SynapHack by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Hackers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Hackathons Hosted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Projects Built</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're looking to participate in your first hackathon or organize the next big event, we're here to
            support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/hackathons">Browse Hackathons</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20 mt-16">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 SynapHack. Built for innovators, by innovators.</p>
        </div>
      </footer>
    </div>
  )
}
