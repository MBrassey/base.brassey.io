"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useAccount, useConnect } from "wagmi"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const { isConnected, address } = useAccount()
  const { connectors, connect, isPending, error } = useConnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address && isMounted) {
      // If we have an address, consider it a successful connection
      login(address)
      router.push("/dashboard")
    }
  }, [isConnected, address, login, router, isMounted])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && isMounted) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isMounted])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const connector = connectors[0] // Use the first available connector
      if (connector) {
        // Just initiate the connection and let the useEffect handle success
        await connect({ connector })

        // Don't set any errors here - let the useEffect above handle successful connections
      } else {
        setConnectionError("No wallet connector available. Please install a wallet extension.")
        setIsConnecting(false)
      }
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
    }

    // Note: We don't set isConnecting to false here because we want to
    // keep the "Connecting..." state until the user completes or cancels the process
  }

  // Reset connecting state if there's an error or the process is cancelled
  useEffect(() => {
    if (error) {
      setIsConnecting(false)
      // Only set error if it's not a user rejection (which is expected)
      if (!error.message.includes("rejected") && !error.message.includes("denied")) {
        setConnectionError(error.message)
      }
    }
  }, [error])

  // Don't render anything during SSR or if already authenticated
  if (!isMounted || isAuthenticated || isConnected) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-mono">
            <span className="text-primary">base</span>
            <span className="text-foreground">.brassey.io</span>
          </CardTitle>
          <CardDescription>Connect your wallet to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-full rounded-lg border bg-card p-4">
            <div className="flex flex-col items-center gap-2">
              <Button onClick={handleConnect} disabled={isPending || isConnecting} className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
              {connectionError && <p className="text-sm text-red-500 mt-2 text-center">{connectionError}</p>}
              {isConnecting && !connectionError && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Please complete the connection in your wallet...
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <p>Connect with your Coinbase Wallet or other Ethereum wallets</p>
          <p>Your wallet is used to securely access your dashboard</p>
        </CardFooter>
      </Card>
    </div>
  )
}
