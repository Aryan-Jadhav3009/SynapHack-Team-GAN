import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "SynapHack - Hackathon Platform",
  description: "The ultimate platform for organizing and participating in hackathons",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <ClientThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}
