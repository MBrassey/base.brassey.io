"use client"

import { useState, useEffect } from "react"
import { Filter, LayoutDashboard, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { ErrorBoundary } from "./error-boundary"
import { WalletCard } from "./wallet-card"
import { NFTGallery } from "./nft-gallery"
import { TokenGallery } from "./token-gallery"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"

export function CustomDashboard() {
  const [isMounted, setIsMounted] = useState(true) // Set to true by default for client components
  const { address, logout } = useAuth()
  const router = useRouter()
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlockHeight = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/block-height', {
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && typeof data.blockNumber === 'number') {
          console.log('Block height fetched:', data.blockNumber);
          setBlockHeight(data.blockNumber);
        } else {
          console.error('Invalid block number in response:', data);
          throw new Error('Invalid block number response');
        }
      } catch (error) {
        console.error('Error fetching block height:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchBlockHeight();
    
    // Refresh block height every 30 seconds
    const interval = setInterval(fetchBlockHeight, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ErrorBoundary
        fallback={
          <nav className="flex h-14 items-center border-b border-border bg-background px-4 lg:h-[60px]">
            <div className="flex items-center gap-0 font-mono text-xl">
              <span className="text-primary">base</span>
              <span className="text-foreground">.earn</span>
            </div>
          </nav>
        }
      >
        <DashboardHeader />
      </ErrorBoundary>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r border-border bg-background md:flex lg:w-[240px]">
          <div className="flex flex-col gap-2 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground transition-all hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
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
                {loading ? (
                  <span className="flex items-center">
                    <Spinner size="sm" color="white" className="mr-2" />
                    <span>Loading...</span>
                  </span>
                ) : blockHeight ? (
                  `Block: ${blockHeight.toLocaleString()}`
                ) : (
                  'Connecting...'
                )}
              </Button>
            </div>
          </div>

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
                      Unable to load tokens. Please try again later.
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
                      Unable to load NFTs. Please try again later.
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
