"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ExternalLink, LogOut, LayoutDashboard, User } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { ErrorBoundary } from "@/components/error-boundary"
import { BaseAvatar, BaseName } from "@/components/onchain-components"

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, address, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated || !address) {
    return null
  }

  // Base explorer URL
  const baseExplorerUrl = "https://basescan.org"

  // Format address for display (fallback)
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
        {/* Add the same sidebar as in dashboard */}
        <aside className="hidden w-[200px] flex-col border-r border-border bg-background md:flex lg:w-[240px]">
          <div className="flex flex-col gap-2 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground transition-all hover:text-foreground"
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
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>View and manage your onchain identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Identity Card with enhanced styling */}
              <div className="rounded-lg border bg-card/50 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Identity</h3>
                  <div className="flex items-center gap-4">
                    <ErrorBoundary
                      fallback={
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      }
                    >
                      <BaseAvatar address={address} size="lg" />
                    </ErrorBoundary>
                    <div>
                      <h2 className="text-lg font-semibold">
                        <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                          <BaseName address={address} />
                        </ErrorBoundary>
                      </h2>
                      <p className="text-sm text-muted-foreground">Base Network</p>
                    </div>
                  </div>
                </div>

                {/* External links */}
                <div className="mt-6 space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">View on Explorer</h3>
                  <Link
                    href={`${baseExplorerUrl}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View wallet on BaseScan
                  </Link>
                </div>
              </div>

              {/* Account settings section */}
              <div className="rounded-lg border bg-card/50 p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Connected Wallet</h4>
                      <p className="text-sm text-muted-foreground truncate max-w-[250px] md:max-w-[350px]">{address}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${baseExplorerUrl}/address/${address}`, "_blank")}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}
