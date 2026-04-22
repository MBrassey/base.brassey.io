"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { WalletIdentity } from "@/components/wallet-identity"
import { LoadingOverlay } from "@/components/loading-overlay"
import { ErrorBoundary } from "@/components/error-boundary"

export default function IdentityPage() {
  const router = useRouter()
  const { isAuthenticated, address, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.push("/")
  }, [isInitialized, isAuthenticated, router])

  if (!isInitialized || !isAuthenticated || !address) {
    return <LoadingOverlay isLoading={true} text="Loading identity…" />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorBoundary>
        <DashboardHeader />
      </ErrorBoundary>
      <main className="flex-1 pt-14 lg:pt-[60px]">
        <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-6 md:py-10">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mint">identity</div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Wallet identity</h1>
          </div>
          <div className="panel p-6 md:p-8">
            <WalletIdentity address={address} />
          </div>
        </div>
      </main>
    </div>
  )
}
