"use client"
import { ReactNode } from "react"
import { TutorItThemeProvider } from "./theme-provider.tsx"

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <TutorItThemeProvider>
      {children}
    </TutorItThemeProvider>
  )
}
