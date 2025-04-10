"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useAccount } from "wagmi"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isConnected, address } = useAccount()
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address && isMounted) {
      router.push("/dashboard")
    }
  }, [isConnected, address, router, isMounted])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && isMounted) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isMounted])

  // Don't render anything during SSR or if already authenticated
  if (!isMounted || isAuthenticated || isConnected) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <img 
              src="/base-logo.svg" 
              alt="Base Logo"
              className="h-6 w-6"
            />
          </div>
          <CardTitle className="text-2xl font-mono">
            <span className="text-primary">base</span>
            <span className="text-foreground">.brassey.io</span>
          </CardTitle>
          <CardDescription>Connect your wallet to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-full rounded-lg pulsating-border bg-card p-4">
            <div className="flex flex-col items-center gap-2">
              <WalletConnectionModal />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <p>Connect with your Ethereum wallet</p>
          <p>Your wallet is used to securely access your dashboard</p>
        </CardFooter>
      </Card>
    </div>
  )
}
