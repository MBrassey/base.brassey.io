"use client"

import { useState, useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function ConnectWalletButton() {
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected, address } = useAccount()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { login } = useAuth()

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address) {
      login(address)
      setIsConnecting(false)
    }
  }, [isConnected, address, login])

  // Reset connecting state if there's an error
  useEffect(() => {
    if (error) {
      setIsConnecting(false)
      // Only set error if it's not a user rejection (which is expected)
      if (!error.message.includes("rejected") && !error.message.includes("denied")) {
        setConnectionError(error.message)
      }
    }
  }, [error])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const connector = connectors[0] // Use the first available connector
      if (connector) {
        // Just initiate the connection and let the useEffect handle success
        await connect({ connector })

        // Don't set any errors here - let the user interact with the popup
        // The useEffect above will handle successful connections
      } else {
        setConnectionError("No wallet connector available. Please install a wallet extension.")
        setIsConnecting(false)
      }
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleConnect} disabled={isPending || isConnecting} className="w-full">
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {connectionError && <p className="text-sm text-red-500">{connectionError}</p>}
      {isConnecting && !connectionError && (
        <p className="text-sm text-muted-foreground">Please complete the connection in your wallet...</p>
      )}
    </div>
  )
}
