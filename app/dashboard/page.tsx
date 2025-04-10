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
  const { isAuthenticated } = useAuth()
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isConnected) {
      router.push("/")
    } else {
      // Simulate loading state for better UX
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [isAuthenticated, isConnected, router])

  // Show loading overlay while checking authentication
  if (!isAuthenticated && !isConnected) {
    return <LoadingOverlay isLoading={true} text="Checking authentication..." />
  }

  return (
    <>
      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} text="Loading dashboard..." />
      
      {/* Main content */}
      <OnchainKitWrapper>
        <ErrorBoundary
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                <p className="text-muted-foreground mb-4">
                  We encountered an error loading your dashboard. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          }
        >
          <CustomDashboard />
        </ErrorBoundary>
      </OnchainKitWrapper>
    </>
  )
}
