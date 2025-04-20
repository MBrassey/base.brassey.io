"use client"

import { useState } from "react"
import { LayoutDashboard, Plus, User, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { WalletCard } from "./wallet-card"
import { ErrorBoundary } from "./error-boundary"
import { NFTGallery } from "./nft-gallery"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { address, logout, isLoggingOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error during logout:", error)
      // Force navigation to login even if logout fails
      router.replace('/')
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <ErrorBoundary
        fallback={
          <nav className="flex h-14 items-center border-b border-border bg-black px-4 lg:h-[60px]">
            <div className="flex items-center gap-2 font-semibold">
              <User className="h-6 w-6" />
              <span>earn.base</span>
            </div>
          </nav>
        }
      >
        <DashboardHeader />
      </ErrorBoundary>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r border-border bg-black md:flex lg:w-[240px]">
          <div className="flex flex-col gap-2 p-4">
            <Link
              href="#"
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
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              )}
            </button>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 font-semibold text-lg md:text-2xl">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Base Wallet Card - Full width by default */}
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
