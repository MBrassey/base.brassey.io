"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  LogOut,
  Loader2,
  RefreshCw,
  Twitter,
  Github,
  Globe,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { ErrorBoundary } from "@/components/error-boundary"
import { Socials } from "@coinbase/onchainkit/identity"
import { BaseAvatar, BaseName } from "@/components/onchain-components"
import { base } from "viem/chains"
import { useProfile } from "@/hooks/use-profile"
import { useQueryClient } from "@tanstack/react-query"
import { LoadingOverlay } from "@/components/loading-overlay"

type DirectSocialLink = {
  platform: string
  url: string
  username: string
  icon: React.ReactNode
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, address, logout, isLoggingOut, isInitialized } = useAuth()
  const { data: profileData, isLoading: isProfileLoading } = useProfile()
  const queryClient = useQueryClient()
  const [formattedAddress, setFormattedAddress] = useState<`0x${string}` | null>(null)
  const [directSocials, setDirectSocials] = useState<DirectSocialLink[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isInitialized) return
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    if (address) {
      setFormattedAddress(
        (address.startsWith("0x") ? address : `0x${address}`) as `0x${string}`,
      )
    }
  }, [isAuthenticated, router, address, isInitialized])

  useEffect(() => {
    if (address) queryClient.invalidateQueries({ queryKey: ["profile"] })
  }, [address, queryClient])

  useEffect(() => {
    if (!formattedAddress) return
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 3000)
    ;(async () => {
      try {
        const res = await fetch(
          `https://api.coinbase.com/identity/v1/socials?chain_id=${base.id}&address=${formattedAddress}`,
          { signal: ac.signal, mode: "cors" },
        ).catch(() => null)
        clearTimeout(t)
        if (!res || !res.ok) {
          setDirectSocials([])
          return
        }
        const data = await res.json().catch(() => null)
        if (data && Array.isArray(data.socials)) {
          const links: DirectSocialLink[] = data.socials
            .filter((s: any) => s.url && s.platform)
            .map((s: any) => {
              const p = s.platform.toLowerCase()
              let icon: React.ReactNode = <ExternalLink className="h-4 w-4" />
              if (p.includes("twitter") || p.includes("x.com")) icon = <Twitter className="h-4 w-4" />
              else if (p.includes("github")) icon = <Github className="h-4 w-4" />
              else if (p.includes("website") || p.includes("personal")) icon = <Globe className="h-4 w-4" />
              return {
                platform: s.platform,
                url: s.url,
                username: s.username || s.url.split("/").pop() || s.platform,
                icon,
              }
            })
          setDirectSocials(links)
        } else {
          setDirectSocials([])
        }
      } catch {
        setDirectSocials([])
      }
    })()
    return () => clearTimeout(t)
  }, [formattedAddress])

  const handleCopy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* noop */
    }
  }

  if (!isInitialized || !isAuthenticated || !address) {
    return <LoadingOverlay isLoading={true} text="Loading profile…" />
  }

  const baseExplorerUrl = "https://basescan.org"
  const formatAddress = (addr: string) => (addr ? `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}` : "")

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorBoundary>
        <DashboardHeader />
      </ErrorBoundary>

      <main className="flex-1 pt-14 lg:pt-[60px]">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
          <div className="animate-fade-in-up mb-8">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mint">profile</div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Your onchain identity</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Basename, socials, and a direct link into BaseScan — nothing stored, rendered live.
            </p>
          </div>

          {isProfileLoading && (
            <div className="panel p-8">
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-mint" />
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  loading profile…
                </p>
              </div>
            </div>
          )}

          {!isProfileLoading && profileData && formattedAddress && (
            <div className="animate-fade-in-up space-y-6">
              {/* Identity card */}
              <div className="panel p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-5">
                    <ErrorBoundary fallback={<div className="h-16 w-16 rounded-full bg-mint/20" />}>
                      <BaseAvatar address={address} size="lg" />
                    </ErrorBoundary>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        identity
                      </div>
                      <h2 className="truncate font-display text-2xl font-semibold tracking-tight">
                        <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                          <BaseName address={address} />
                        </ErrorBoundary>
                      </h2>
                      <button
                        onClick={handleCopy}
                        className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-mint"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "copied" : formatAddress(address)}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      socials
                    </div>
                    <ErrorBoundary
                      fallback={
                        <div className="font-mono text-xs text-muted-foreground">Social links unavailable</div>
                      }
                    >
                      <div className="social-links-container">
                        <Socials address={formattedAddress} chain={base} />
                      </div>
                    </ErrorBoundary>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    explorer
                  </div>
                  <Link
                    href={`${baseExplorerUrl}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm text-mint transition-colors hover:text-mint/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                    basescan.org/address/{formatAddress(address)}
                  </Link>
                </div>
              </div>

              {/* Account */}
              <div className="panel p-6 md:p-8">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  connected wallet
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold">Wallet</div>
                    <p className="truncate font-mono text-xs text-muted-foreground">{address}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${baseExplorerUrl}/address/${address}`, "_blank")}
                    className="border-border bg-surface-0 font-mono text-[11px] uppercase tracking-[0.18em] hover:border-mint/50 hover:text-mint"
                  >
                    view
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      signing out…
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      sign out
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isProfileLoading && (!profileData || !formattedAddress) && (
            <div className="panel p-8">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="font-display text-lg font-semibold">Profile unavailable</div>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    try refreshing the page
                  </p>
                </div>
                <Button
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["profile"] })
                    window.location.reload()
                  }}
                  className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                >
                  refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
