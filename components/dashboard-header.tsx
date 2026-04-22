"use client"

import { useState } from "react"
import { LogOut, Menu, User, LayoutDashboard, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { cn } from "@/lib/utils"

function Wordmark() {
  return (
    <Link href="/dashboard" className="group inline-flex items-baseline gap-0 text-lg font-bold tracking-tight">
      <span className="wordmark-base">base</span>
      <span className="wordmark-dot">.</span>
      <span className="wordmark-brassey transition-opacity group-hover:opacity-80">brassey</span>
      <span className="wordmark-dot">.</span>
      <span className="wordmark-io">io</span>
    </Link>
  )
}

function NavLink({ href, icon: Icon, children, active }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
      {active && <span className="absolute inset-x-3 -bottom-px h-px bg-mint" />}
    </Link>
  )
}

export function DashboardHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { address, logout, isLoggingOut } = useAuth()
  const pathname = usePathname()

  const formatAddress = (addr: string) => (addr ? `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}` : "")

  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl lg:h-[60px] lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 border-border bg-surface-1 md:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col border-r border-border bg-surface-1 p-0">
            <div className="px-6 py-5">
              <Wordmark />
            </div>
            <div className="border-t border-border p-3">
              <NavLink href="/dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"}>
                Dashboard
              </NavLink>
              <NavLink href="/profile" icon={User} active={pathname === "/profile"}>
                Profile
              </NavLink>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <Wordmark />

        <div className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"}>
            Dashboard
          </NavLink>
          <NavLink href="/profile" icon={User} active={pathname === "/profile"}>
            Profile
          </NavLink>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden status-badge sm:inline-flex">
          base · live
        </span>

        {address && (
          <div className="flex items-center gap-2">
            <div className="hidden rounded-md border border-border bg-surface-1 px-2.5 py-1 font-mono text-xs text-muted-foreground sm:block">
              <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                <BaseName address={address} />
              </ErrorBoundary>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="rounded-full outline-none ring-offset-2 ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-mint"
                >
                  <ErrorBoundary
                    fallback={
                      <div className="h-8 w-8 rounded-full bg-mint/20 ring-1 ring-white/10" />
                    }
                  >
                    <BaseAvatar address={address} size="sm" />
                  </ErrorBoundary>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-surface-1">
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {formatAddress(address)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-destructive focus:text-destructive"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Signing out…</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  )
}
