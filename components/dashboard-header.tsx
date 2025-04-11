"use client"

import { useState } from "react"
import { LogOut, Menu, Settings, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { ErrorBoundary } from "./error-boundary"
import { BaseAvatar, BaseName } from "./onchain-components"

export function DashboardHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { address, logout, isLoggingOut } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    // No router.push needed
  }

  // Format address for display (fallback)
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-border bg-black/60 backdrop-blur-md px-4 lg:h-[60px]">
      <div className="flex items-center gap-2 lg:gap-3">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 bg-black border-r border-border">
            <div className="px-6 py-4">
              <Link href="/dashboard" className="flex items-center gap-0 font-mono text-xl">
                <span className="text-primary">base</span>
                <span className="text-foreground">.brassey.io</span>
              </Link>
            </div>
            <div className="border-t border-border">
              <div className="flex flex-col gap-2 p-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground transition-all hover:text-foreground"
                >
                  <User className="h-4 w-4" />
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
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
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
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-0 font-mono text-xl">
          <span className="text-primary">base</span>
          <span className="text-foreground">.brassey.io</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {address && (
          <div className="flex items-center gap-2">
            {/* Display basename using BaseName component */}
            <div className="text-sm font-medium">
              <ErrorBoundary fallback={<span className="text-sm font-medium">{formatAddress(address)}</span>}>
                <BaseName address={address} />
              </ErrorBoundary>
            </div>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full overflow-hidden p-0 h-8 w-8">
                  <BaseAvatar address={address} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {!address && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
