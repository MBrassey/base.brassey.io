"use client"

import React, { useState, useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, MousePointerClick, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { WalletIcon } from "@/components/wallet-icon"
import { cn } from "@/lib/utils"

// CSS for the pulsating button
const pulsateCSS = `
@keyframes pulsate {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 126, 155, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 126, 155, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 126, 155, 0);
  }
}

.button-pulsate {
  animation: pulsate 1.5s infinite;
  border-radius: 0.5rem;
  position: relative;
}
`;

export function WalletConnectionModal() {
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected, address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { login } = useAuth()

  // Log all connectors and their IDs to ensure we're matching correctly
  useEffect(() => {
    console.log("Available connectors:", connectors.map(c => ({ id: c.id, name: c.name })))
  }, [connectors])

  const walletNames: Record<string, string> = {
    "injected": "MetaMask",
    "metaMask": "MetaMask",
    "coinbaseWallet": "Coinbase Wallet",
    "walletConnect": "WalletConnect",
    "phantom": "Phantom",
    "brave": "Brave", 
  }

  // Reset error when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setConnectionError(null)
      setIsConnecting(false)
      setSelectedConnector(null)
      setDebugInfo(null)
    }
  }, [isOpen])

  // Log when account state changes
  useEffect(() => {
    console.log("Account state changed:", { isConnected, address })
    if (isConnected && address) {
      console.log("Successfully connected with address:", address)
      setDebugInfo(`Connected: ${address}`)
    }
  }, [isConnected, address])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error("Connection error:", error)
      setIsConnecting(false)
      setDebugInfo(`Error: ${error.message}`)
      
      // Only set error if it's not a user rejection (which is expected)
      if (!error.message.includes("rejected") && !error.message.includes("denied")) {
        setConnectionError(error.message)
      } else {
        setConnectionError(null)
      }
    }
  }, [error])

  // If connection is successful, close the modal and reset state
  useEffect(() => {
    if (isConnected && address && isOpen) {
      login(address)
      console.log("Logging in with address:", address)
      setIsOpen(false)
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }, [isConnected, address, isOpen, login])

  const handleConnect = async (connector: any) => {
    console.log("Connecting with connector:", connector.id)
    setIsConnecting(true)
    setConnectionError(null)
    setSelectedConnector(connector.id)
    setDebugInfo(`Initiating connection with ${connector.id}...`)

    try {
      // For Coinbase Wallet, let's try to force mobile
      let options: any = {}
      
      if (connector.id === 'coinbaseWallet') {
        options = { 
          appOnly: false // Try allowing all connection methods
        }
      }
      
      // Initiate the connection with the selected connector
      console.log("Connecting with options:", options)
      await connect({ connector, ...options })
      
      // Add a timeout to check if the connection was successful
      setTimeout(() => {
        if (!isConnected && selectedConnector === 'coinbaseWallet') {
          setDebugInfo("Coinbase connection timed out. Try using MetaMask instead.")
        }
      }, 15000)
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setDebugInfo(`Exception: ${err instanceof Error ? err.message : String(err)}`)
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }

  return (
    <>
      <style>{pulsateCSS}</style>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className={cn("w-full button-pulsate bg-black/5 dark:bg-white/5")}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to this application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant={selectedConnector === connector.id ? "default" : "outline"}
                className="w-full justify-start h-14"
                disabled={isPending || (isConnecting && selectedConnector !== connector.id)}
                onClick={() => handleConnect(connector)}
              >
                <div className="mr-3 flex items-center justify-center w-8 h-8">
                  <WalletIcon connectorId={connector.id} name={connector.name} />
                </div>
                <div className="flex flex-col items-start">
                  <span>
                    {connector.id === 'injected' && connector.name.toLowerCase().includes('brave') 
                      ? 'Brave' 
                      : walletNames[connector.id] || connector.name}
                  </span>
                  {connector.id === "coinbaseWallet" && (
                    <span className="text-xs text-muted-foreground">Mobile or QR connection</span>
                  )}
                </div>
                {isConnecting && selectedConnector === connector.id && (
                  <MousePointerClick className="ml-auto animate-pulse h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
          
          {isConnecting && selectedConnector === "coinbaseWallet" && (
            <div className="bg-muted p-3 rounded-md mt-2">
              <p className="text-sm text-center mb-2">
                <strong>Having trouble with Coinbase Wallet?</strong>
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>If you have a passkey, try using that or try opening Coinbase Wallet app first</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Make sure you have a Base network wallet set up in your Coinbase Wallet app</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Try using MetaMask instead which has better support for Base network</span>
                </li>
              </ul>
            </div>
          )}
          
          {connectionError && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              <p>{connectionError}</p>
            </div>
          )}
          
          {debugInfo && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
            </div>
          )}
          
          {isConnecting && !connectionError && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please complete the connection in your wallet...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 