"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

const ThemeProvider = dynamic(() => import("./theme-provider").then((mod) => mod.ThemeProvider), { ssr: false })

interface ClientThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ClientThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
}: ClientThemeProviderProps) {
  return (
    <ThemeProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </ThemeProvider>
  )
}
