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
  const { login } = useAuth()

  // Reset error when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setConnectionError(null)
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }, [isOpen])

  // If connection is successful, close the modal and reset state
  useEffect(() => {
    if (isConnected && address && isOpen) {
      // Call login function with the connected address
      login(address)
      
      // Reset UI state
      setIsConnecting(false)
      setSelectedConnector(null)
      setIsOpen(false)
    }
  }, [isConnected, address, isOpen, login])

  // Handle errors
  useEffect(() => {
    if (error) {
      setIsConnecting(false)
      
      // Only set error if it's not a user rejection
      if (!error.message.includes("rejected") && !error.message.includes("denied")) {
        setConnectionError(error.message)
      } else {
        setConnectionError(null)
      }
    }
  }, [error])

  const handleConnect = async (connector: any) => {
    setIsConnecting(true)
    setConnectionError(null)
    setSelectedConnector(connector.id)

    try {
      // Configure options for different connectors
      let options: any = {}
      
      // Specific connector options
      if (connector.id === 'coinbaseWallet') {
        options = { appOnly: false }
      }
      
      if (connector.id === 'walletConnect') {
        options = { showQrModal: true }
      }
      
      // Connect with the selected connector
      await connect({ connector, ...options })
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }

  // Simple helper to get wallet descriptions
  const getWalletDescription = (connector: any) => {
    if (connector.id === "coinbaseWallet") return "Mobile or QR connection";
    if (connector.id === "walletConnect") return "Connect any wallet";
    if (connector.id === "injected" || connector.id === "metaMask") return "Browser extension";
    if (connector.id === "phantom") return "Solana wallet";
    return "";
  }

  // Simple helper to get wallet display names
  const getWalletDisplayName = (connector: any) => {
    if (connector.id === "metaMask") return "MetaMask";
    if (connector.id === "injected") {
      if (connector.name?.toLowerCase().includes("brave")) return "Brave";
      if (connector.name?.toLowerCase().includes("metamask")) return "MetaMask";
      return connector.name || "Browser Extension";
    }
    if (connector.id === "coinbaseWallet") return "Coinbase Wallet";
    if (connector.id === "walletConnect") return "WalletConnect";
    if (connector.id === "phantom") return "Phantom";
    return connector.name || "Unknown Wallet";
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
        <DialogContent className="max-w-[95%] w-full sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to this application
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-3">            
            {/* Display all connectors */}
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant={selectedConnector === connector.id ? "default" : "outline"}
                className="w-full justify-start h-14 px-3 md:px-4"
                disabled={isPending || (isConnecting && selectedConnector !== connector.id)}
                onClick={() => handleConnect(connector)}
              >
                <div className="mr-3 flex items-center justify-center w-8 h-8">
                  <WalletIcon connectorId={connector.id} name={connector.name} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{getWalletDisplayName(connector)}</span>
                  <span className="text-xs text-muted-foreground">
                    {getWalletDescription(connector)}
                  </span>
                </div>
                {isConnecting && selectedConnector === connector.id && (
                  <MousePointerClick className="ml-auto animate-pulse h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
          
          {isConnecting && (
            <div className="bg-muted p-3 rounded-md mt-2">
              <p className="text-sm text-center">
                Please confirm the connection in your wallet
              </p>
            </div>
          )}
          
          {connectionError && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              <p>{connectionError}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 