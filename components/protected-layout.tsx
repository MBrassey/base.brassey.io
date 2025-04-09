"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ErrorBoundary } from "./error-boundary"

interface ProtectedLayoutProps {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && isMounted) {
      router.push("/")
    }
  }, [isAuthenticated, router, isMounted])

  if (!isMounted) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen flex-col bg-background">
          <div className="p-4">
            <p>Something went wrong. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
