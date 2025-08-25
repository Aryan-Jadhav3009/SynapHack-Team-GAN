"use client"
import { useEffect, type PropsWithChildren } from "react"

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme")
      const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches

      const theme = stored || (prefersDark ? "dark" : "light")

      if (theme === "dark") {
        document.documentElement.classList.add("dark")
        document.documentElement.style.setProperty("color-scheme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        document.documentElement.style.setProperty("color-scheme", "light")
      }
    } catch (e) {
      // fail silently — do not throw on server or in constrained environments
      console.warn("Theme init failed", e)
    }
  }, [])

  return <>{children}</>
}
