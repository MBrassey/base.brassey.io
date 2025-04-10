"use client"

import React, { useState, useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, MousePointerClick, AlertCircle, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

export function WalletConnectionModal() {
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected, address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { login } = useAuth()

  const walletIcons: Record<string, string> = {
    metaMask: "/wallet-icons/metamask.svg",
    coinbaseWallet: "/wallet-icons/coinbase.svg",
    walletConnect: "/wallet-icons/walletconnect.svg",
  }

  const walletNames: Record<string, string> = {
    metaMask: "MetaMask",
    coinbaseWallet: "Coinbase Wallet",
    walletConnect: "WalletConnect",
  }

  // Reset error when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setConnectionError(null)
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }, [isOpen])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error("Connection error:", error)
      setIsConnecting(false)
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
      setIsOpen(false)
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }, [isConnected, address, isOpen, login])

  const handleConnect = async (connector: any) => {
    setIsConnecting(true)
    setConnectionError(null)
    setSelectedConnector(connector.id)

    try {
      // For Coinbase Wallet, set preference for QR code
      let options = {}
      if (connector.id === 'coinbaseWallet') {
        options = { 
          // Force QR mode for Coinbase Wallet
          qrCode: true
        }
      }

      // Initiate the connection with the selected connector
      await connect({ connector, ...options })
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
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
                {walletIcons[connector.id] ? (
                  <Image 
                    src={walletIcons[connector.id]} 
                    alt={connector.name} 
                    width={28} 
                    height={28} 
                  />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span>{walletNames[connector.id] || connector.name}</span>
                {connector.id === "coinbaseWallet" && (
                  <span className="text-xs text-muted-foreground">QR Code connection</span>
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
                <span>If you're seeing passkey errors, try using your Coinbase Wallet mobile app instead</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Open your Coinbase Wallet app and scan the QR code</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Be sure to approve the connection in your wallet app</span>
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
        
        {isConnecting && !connectionError && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Please complete the connection in your wallet...
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
} 