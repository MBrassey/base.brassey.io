"use client"

import { useState } from "react"
import { Filter, LayoutDashboard, Plus, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { ErrorBoundary } from "./error-boundary"
import { WalletCard } from "./wallet-card"

export function CustomDashboard() {
  const [isMounted, setIsMounted] = useState(true) // Set to true by default for client components
  const { address, logout } = useAuth()
  const router = useRouter()

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
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
              </Button>
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Base Wallet Card */}
          {address && (
            <div className="w-full">
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
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
