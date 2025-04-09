"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "./error-boundary"

export default function ClientOnlyProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  // Remove direct references to environment variables
  // We'll handle this differently without exposing sensitive keys

  // Only render children after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Return children without OnchainKit during SSR
  if (!isMounted) {
    return <>{children}</>
  }

  // Render with error boundary on client-side
  return <ErrorBoundary fallback={<>{children}</>}>{children}</ErrorBoundary>
}
