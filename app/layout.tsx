import type React from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

// Dynamically import ThemeProvider so it is client-only (prevents server-side class changes)
const ClientThemeProvider = dynamic(
  () =>
    import("@/components/theme-provider").then((mod) => {
      // export may be named; ensure we return the named export
      return mod.ThemeProvider ? mod.ThemeProvider : mod.default
    }),
  { ssr: false }
)

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
      <body>
        {/* ThemeProvider is client-only to avoid SSR hydration mismatches */}
        <ClientThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}

