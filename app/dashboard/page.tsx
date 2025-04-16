"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useAccount } from "wagmi"
import { CustomDashboard } from "@/components/custom-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"
import OnchainKitWrapper from "@/components/onchain-kit-wrapper"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuth()
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isMounted) return

    if (!isAuthenticated && !isConnected && isInitialized) {
      router.push("/")
    } else {
      // Simulate loading state for better UX
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [isAuthenticated, isConnected, router, isMounted, isInitialized])

  // Show loading overlay while checking authentication
  if (!isMounted || (!isAuthenticated && !isConnected) || isLoading) {
    return <LoadingOverlay isLoading={true} text="Checking authentication..." />
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground mt-2">
              Unable to load dashboard. Please try again later.
            </p>
          </div>
        </div>
      }
    >
      <CustomDashboard />
    </ErrorBoundary>
  )
}
