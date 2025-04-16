"use client"

import { useState, useEffect } from "react"
import { Filter, LayoutDashboard, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { base } from "viem/chains"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { ErrorBoundary } from "./error-boundary"
import { WalletCard } from "./wallet-card"
import { NFTGallery } from "./nft-gallery"
import { TokenGallery } from "./token-gallery"
import { Spinner } from "@/components/ui/spinner"
import { useBlockHeight } from "@/hooks/use-block-height"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

export function CustomDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { address, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { data: blockHeightData, isLoading: isBlockHeightLoading, error: blockHeightError, refetch: refetchBlockHeight } = useBlockHeight()
  const queryClient = useQueryClient()

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true)
    // Add a small delay before setting loading to false to ensure data is ready
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Increased delay to match DashboardPage
    return () => clearTimeout(timeout)
  }, [])

  // Force data loading on mount and handle authentication
  useEffect(() => {
    if (!isMounted) return
    
    if (!address) {
      router.push('/')
      return
    }

    // Clear existing data first to force a fresh load
    queryClient.removeQueries({ queryKey: ["tokens"] });
    queryClient.removeQueries({ queryKey: ["nfts"] });
    queryClient.removeQueries({ queryKey: ["blockHeight"] });

    // Immediate invalidation
    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] })
      queryClient.invalidateQueries({ queryKey: ["nfts"] })
      queryClient.invalidateQueries({ queryKey: ["blockHeight"] })
    }

    // Execute immediate invalidation
    invalidateQueries()
    
    // Staggered invalidations to ensure data loads properly
    const timeouts = [800, 2000, 5000].map(delay => 
      setTimeout(() => {
        if (address) {  // Only refetch if still authenticated
          invalidateQueries()
        }
      }, delay)
    )
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [address, queryClient, router, isMounted])

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!address) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <ErrorBoundary
        fallback={
          <nav className="flex h-14 items-center border-b border-border bg-black px-4 lg:h-[60px]">
            <div className="flex items-center gap-0 font-mono text-xl">
              <span className="text-primary">base</span>
              <span className="text-foreground">.earn</span>
            </div>
          </nav>
        }
      >
        <DashboardHeader />
      </ErrorBoundary>
      <div className="flex flex-1 pt-14 lg:pt-[60px]">
        <aside className="hidden w-[200px] flex-col border-r border-border bg-black md:flex lg:w-[240px] overflow-y-auto">
          <div className="flex flex-col gap-2 p-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:text-foreground ${
                pathname === "/dashboard" 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:text-foreground ${
                pathname === "/profile" 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 font-semibold text-lg md:text-2xl">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 bg-[#0052FF] hover:bg-[#0039b3]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 2500" className="mr-2 h-3.5 w-3.5 text-white">
                  <path 
                    fill="currentColor" 
                    d="M1247.8,2500c691.6,0,1252.2-559.6,1252.2-1250C2500,559.6,1939.4,0,1247.8,0C591.7,0,53.5,503.8,0,1144.9h1655.1v210.2H0C53.5,1996.2,591.7,2500,1247.8,2500z"
                  />
                </svg>
                {isBlockHeightLoading ? (
                  <span className="flex items-center">
                    <Spinner size="sm" color="white" className="mr-2" />
                    <span>Loading...</span>
                  </span>
                ) : blockHeightData?.blockNumber ? (
                  `Block: ${blockHeightData.blockNumber.toLocaleString()}`
                ) : (
                  'Connecting...'
                )}
              </Button>
            </div>
          </div>

          {blockHeightError && (
            <Alert variant="default" className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/50">
              <AlertDescription>
                Network status unavailable. Some data may not be current.
              </AlertDescription>
            </Alert>
          )}

          {/* Base Wallet Card and NFT Gallery */}
          {address && (
            <div className="w-full space-y-4">
              <ErrorBoundary
                fallback={
                  <div className="p-4 border rounded-lg bg-background">
                    <p className="text-center text-muted-foreground">
                      Unable to load wallet information. Please try again later.
                    </p>
                  </div>
                }
              >
                <WalletCard address={address} chain={base} />
              </ErrorBoundary>
              
              <ErrorBoundary
                fallback={
                  <div className="p-4 border rounded-lg bg-background">
                    <p className="text-center text-muted-foreground">
                      Unable to load token information. Please try again later.
                    </p>
                  </div>
                }
              >
                <TokenGallery />
              </ErrorBoundary>
              
              <ErrorBoundary
                fallback={
                  <div className="p-4 border rounded-lg bg-background">
                    <p className="text-center text-muted-foreground">
                      Unable to load NFT information. Please try again later.
                    </p>
                  </div>
                }
              >
                <NFTGallery />
              </ErrorBoundary>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
