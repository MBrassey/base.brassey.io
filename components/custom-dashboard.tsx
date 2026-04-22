"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { ErrorBoundary } from "./error-boundary"
import { WalletCard } from "./wallet-card"
import { NFTGallery } from "./nft-gallery"
import { TokenGallery } from "./token-gallery"
import { Spinner } from "@/components/ui/spinner"
import { useBlockHeight } from "@/hooks/use-block-height"
import { useQueryClient } from "@tanstack/react-query"

function SectionHeading({ eyebrow, title, count }: { eyebrow: string; title: string; count?: number | string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">{eyebrow}</span>
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {count !== undefined && (
        <span className="font-mono text-xs text-muted-foreground">{count}</span>
      )}
    </div>
  )
}

export function CustomDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { address } = useAuth()
  const router = useRouter()
  const { data: blockHeightData, isLoading: isBlockHeightLoading } = useBlockHeight()
  const queryClient = useQueryClient()

  useEffect(() => {
    setIsMounted(true)
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isMounted || isLoggingOut) return
    if (!address) {
      router.push("/")
    }
    // Do not aggressively invalidate on mount — React Query's default
    // staleness handling already covers this and repeatedly invalidating
    // was what caused the dashboard to "flash reload" every few seconds.
  }, [address, router, isMounted, isLoggingOut])

  if (!isMounted || isLoading || isLoggingOut) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {isLoggingOut ? "signing out…" : "loading dashboard…"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!address) return null

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ErrorBoundary
        fallback={
          <nav className="flex h-14 items-center border-b border-border px-4 lg:h-[60px]">
            <span className="font-display text-lg font-semibold">base.brassey.io</span>
          </nav>
        }
      >
        <DashboardHeader />
      </ErrorBoundary>

      <main className="flex-1 pt-14 lg:pt-[60px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
          {/* Page header */}
          <div className="animate-fade-in-up mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
                dashboard
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Onchain overview
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Wallet state, tokens, and NFTs on Base — live.
              </p>
            </div>

            {/* Block-height chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-mint" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {isBlockHeightLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Spinner size="sm" className="h-3 w-3" /> block · syncing
                  </span>
                ) : blockHeightData?.blockNumber ? (
                  <>block · {blockHeightData.blockNumber.toLocaleString()}</>
                ) : (
                  "block · connecting"
                )}
              </span>
            </div>
          </div>

          <div className="space-y-10">
            {/* Wallet + tokens side-by-side on wide screens, stacked on mobile */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
              <section className="animate-fade-in-up space-y-3">
                <SectionHeading eyebrow="wallet" title="Your Base wallet" />
                <ErrorBoundary
                  fallback={
                    <div className="panel p-6 text-center text-sm text-muted-foreground">
                      Unable to load wallet information.
                    </div>
                  }
                >
                  <WalletCard address={address} chain={base} />
                </ErrorBoundary>
              </section>

              <section className="animate-fade-in-up [animation-delay:80ms] space-y-3">
                <SectionHeading eyebrow="balances" title="Tokens" />
                <ErrorBoundary
                  fallback={
                    <div className="panel p-6 text-center text-sm text-muted-foreground">
                      Unable to load token information.
                    </div>
                  }
                >
                  <TokenGallery />
                </ErrorBoundary>
              </section>
            </div>

            <section className="animate-fade-in-up [animation-delay:160ms] space-y-3">
              <SectionHeading eyebrow="collectibles" title="NFT gallery" />
              <ErrorBoundary
                fallback={
                  <div className="panel p-6 text-center text-sm text-muted-foreground">
                    Unable to load NFT information.
                  </div>
                }
              >
                <NFTGallery />
              </ErrorBoundary>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
