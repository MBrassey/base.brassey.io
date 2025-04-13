"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ExternalLink, LogOut, LayoutDashboard, User, Loader2, RefreshCw, Twitter, Github, Globe } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { ErrorBoundary } from "@/components/error-boundary"
import { Socials } from "@coinbase/onchainkit/identity"
import { BaseAvatar, BaseName } from "@/components/onchain-components"
import { base } from "viem/chains"
import { useProfile } from "@/hooks/use-profile"
import { useQueryClient } from "@tanstack/react-query"
import { LoadingOverlay } from "@/components/loading-overlay"

// Custom social type for direct implementation
type DirectSocialLink = {
  platform: string
  url: string
  username: string
  icon: React.ReactNode
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, address, logout, isLoggingOut } = useAuth()
  const { data: profileData, isLoading: isProfileLoading } = useProfile()
  const queryClient = useQueryClient()
  const [formattedAddress, setFormattedAddress] = useState<`0x${string}` | null>(null)
  const [directSocials, setDirectSocials] = useState<DirectSocialLink[]>([])
  const [socialsLoading, setSocialsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
    
    if (address) {
      // Format address to ensure it starts with 0x
      const formatted = address.startsWith('0x') 
        ? address as `0x${string}` 
        : `0x${address}` as `0x${string}`
      setFormattedAddress(formatted)
    }
  }, [isAuthenticated, router, address])

  // Force data loading on mount
  useEffect(() => {
    if (address) {
      // Invalidate profile data to ensure it loads fresh
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      
      // Stagger the data loading with several retries
      const loadTimes = [100, 800, 2000];
      const timeouts = loadTimes.map(time => 
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["profile"] })
        }, time)
      );
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [address, queryClient]);

  // Fetch socials directly to ensure they all load
  useEffect(() => {
    if (!formattedAddress) return;
    
    const fetchSocials = async () => {
      try {
        setSocialsLoading(true);
        
        // Use a timeout to avoid hanging if the request takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Direct fetch from Coinbase identity API - wrapped in try/catch to prevent console errors
        const response = await fetch(`https://api.coinbase.com/identity/v1/socials?chain_id=${base.id}&address=${formattedAddress}`, {
          signal: controller.signal,
          mode: 'cors', // Explicitly state CORS mode
        }).catch(() => null); // Silently catch network errors
        
        clearTimeout(timeoutId);
        
        // If response is null or not OK, silently fail
        if (!response || !response.ok) {
          // Don't show error message, just set empty socials
          setDirectSocials([]);
          return;
        }
        
        const data = await response.json().catch(() => null);
        
        if (data && Array.isArray(data.socials)) {
          // Process social links with icons
          const links = data.socials
            .filter((social: any) => social.url && social.platform)
            .map((social: any) => {
              const platform = social.platform.toLowerCase();
              let icon = <ExternalLink className="h-4 w-4" />;
              
              if (platform.includes('twitter') || platform.includes('x.com')) {
                icon = <Twitter className="h-4 w-4" />;
              } else if (platform.includes('github')) {
                icon = <Github className="h-4 w-4" />;
              } else if (platform.includes('website') || platform.includes('personal')) {
                icon = <Globe className="h-4 w-4" />;
              }
              
              return {
                platform: social.platform,
                url: social.url,
                username: social.username || social.url.split('/').pop() || social.platform,
                icon
              };
            });
          
          setDirectSocials(links);
        } else {
          setDirectSocials([]);
        }
      } catch (error) {
        // Silent fail - no console errors
        setDirectSocials([]);
      } finally {
        setSocialsLoading(false);
      }
    };
    
    fetchSocials();
    
    // Clean up function
    return () => {
      // Nothing to clean up here since we handle abort inside the fetchSocials function
    };
  }, [formattedAddress]);

  const handleLogout = () => {
    logout();
  }

  if (!isAuthenticated || !address) {
    return <LoadingOverlay isLoading={true} text="Checking authentication..." />
  }

  // Base explorer URL
  const baseExplorerUrl = "https://basescan.org"

  // Format address for display (fallback)
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <ErrorBoundary>
        <DashboardHeader />
      </ErrorBoundary>
      <div className="flex flex-1 pt-14 lg:pt-[60px]">
        {/* Add the same sidebar as in dashboard */}
        <aside className="hidden fixed top-14 bottom-0 lg:top-[60px] w-[200px] flex-col border-r border-border bg-black md:flex lg:w-[240px] overflow-y-auto">
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
        <main className="flex flex-1 flex-col space-y-4 items-center justify-start p-4 md:pl-[200px] lg:pl-[240px] md:p-8">
          <div className="flex items-center w-full max-w-3xl justify-between mb-4">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>View and manage your onchain identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Loading state */}
              {isProfileLoading && (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* Identity Card with enhanced styling */}
              {!isProfileLoading && profileData && formattedAddress && (
                <div className="rounded-lg border bg-card/50 p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Identity</h3>
                    <div className="flex items-center gap-4">
                      <ErrorBoundary>
                        <BaseAvatar address={address} size="lg" />
                      </ErrorBoundary>
                      <div>
                        <h2 className="text-lg font-semibold">
                          <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                            <BaseName address={address} />
                          </ErrorBoundary>
                        </h2>
                        <p className="text-sm text-muted-foreground">Base Network</p>
                        
                        {/* Social Links Using OnchainKit Component */}
                        <div className="mt-1">
                          <ErrorBoundary fallback={
                            <div className="text-sm text-muted-foreground">
                              Social links unavailable
                            </div>
                          }>
                            <div className="social-links-container" style={{ color: "#4A7E9B" }}>
                              <style jsx global>{`
                                /* Ensure proper styling of social links */
                                .social-links-container > div {
                                  display: flex !important;
                                  gap: 8px !important;
                                }
                                
                                .social-links-container a {
                                  display: inline-flex !important;
                                  align-items: center !important;
                                  justify-content: center !important;
                                }
                                
                                .social-links-container svg {
                                  width: 18px !important;
                                  height: 18px !important;
                                  color: #4A7E9B !important;
                                  fill: currentColor !important;
                                  opacity: 1 !important;
                                  visibility: visible !important;
                                }
                                
                                .social-links-container path {
                                  fill: currentColor !important;
                                  color: #4A7E9B !important;
                                  stroke: #4A7E9B !important;
                                  opacity: 1 !important;
                                  visibility: visible !important;
                                }
                              `}</style>
                              <Socials 
                                address={formattedAddress}
                                chain={base}
                              />
                            </div>
                          </ErrorBoundary>
                        </div>
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
              )}

              {/* Account settings section */}
              {!isProfileLoading && profileData && (
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
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button 
                variant="destructive" 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="flex items-center gap-2"
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
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}