"use client"

import React, { useState, useEffect } from "react"
import { useConnect, useAccount, type Connector } from "wagmi"
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
import { coinbaseWallet, walletConnect } from "wagmi/connectors"
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"

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

// Required wallet options that should always be shown
const REQUIRED_WALLET_IDS = [
  'injected',
  'metaMask',
  'coinbaseWallet',
  'walletConnect',
  'safe'
];

// Augment the Window interface to include phantom
declare global {
  interface Window {
    phantom?: any;
  }
}

export function WalletConnectionModal() {
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected, address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { login } = useAuth()
  
  // Debug all available connectors
  useEffect(() => {
    console.log("Available connectors:", connectors.map(c => ({ id: c.id, name: c.name })))
  }, [connectors])
  
  // Create a map of all connectors by ID for easy lookup
  const connectorsById: Record<string, Connector> = Object.fromEntries(
    connectors.map(connector => [connector.id, connector])
  );

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

  const handleConnect = async (connector: Connector) => {
    setIsConnecting(true)
    setConnectionError(null)
    setSelectedConnector(connector.id)

    try {
      // Simply connect with the selected connector
      await connect({ connector })
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }

  // Function to create and use a new connector directly
  const handleConnectDirect = async (walletType: 'coinbase' | 'walletConnect') => {
    setIsConnecting(true)
    setConnectionError(null)
    setSelectedConnector(walletType === 'coinbase' ? 'coinbaseWallet' : 'walletConnect')

    try {
      // Create the appropriate connector
      let connector;
      
      if (walletType === 'coinbase') {
        connector = coinbaseWallet({
          appName: "base.brassey.io",
          headlessMode: false,
        });
        setSelectedConnector('coinbaseWallet');
      } else {
        // Default fallback project ID
        const fallbackProjectId = '891aaf3e0e3c9c7ca427dfe291ac3ec4';
        connector = walletConnect({
          projectId: fallbackProjectId,
          showQrModal: true,
          metadata: {
            name: "base.brassey.io",
            description: "Base Name Service",
            url: "https://base.brassey.io",
            icons: ["https://base.brassey.io/base-logo.svg"]
          }
        });
        setSelectedConnector('walletConnect');
      }

      // Use the connector
      await connect({ connector });
    } catch (err) {
      console.error("Connection error:", err)
      setConnectionError(err instanceof Error ? err.message : "Failed to connect. Please try again.")
      setIsConnecting(false)
      setSelectedConnector(null)
    }
  }

  // Simple helper to get wallet display names
  const getWalletDisplayName = (connector: Connector) => {
    if (connector.id === "metaMask") return "MetaMask";
    if (connector.id === "injected") {
      if (connector.name?.toLowerCase().includes("brave")) return "Brave Wallet";
      if (connector.name?.toLowerCase().includes("opera")) return "Opera Wallet";
      if (connector.name?.toLowerCase().includes("metamask")) return "MetaMask";
      if (connector.name?.toLowerCase().includes("phantom")) return "Phantom";
      return connector.name || "Browser Wallet";
    }
    if (connector.id === "coinbaseWallet") return "Coinbase Wallet";
    if (connector.id === "walletConnect") return "WalletConnect";
    if (connector.id === "safe") return "Safe Wallet";
    return connector.name || "Unknown Wallet";
  }

  // Function to safely check if Phantom is available
  const isPhantomAvailable = (): boolean => {
    return typeof window !== 'undefined' && 'phantom' in window;
  }

  // Create an array with sorted connectors
  // First show popular ones like MetaMask and Phantom (injected)
  // Then show WalletConnect and Coinbase which work on mobile
  const getDisplayConnectors = (): Connector[] => {
    // Log connectorsById to check what's available
    console.log("connectorsById:", Object.keys(connectorsById))
    
    // First add any available phantom or metamask connectors
    const displayConnectors: Connector[] = [];
    
    // Add Phantom if detected
    const phantomConnector = connectors.find(c => 
      c.name?.toLowerCase().includes('phantom') ||
      (c.id === 'injected' && isPhantomAvailable())
    );
    if (phantomConnector) {
      displayConnectors.push(phantomConnector);
    }
    
    // Add MetaMask if available
    const metamaskConnector = connectorsById['metaMask'];
    if (metamaskConnector) {
      displayConnectors.push(metamaskConnector);
    }
    
    // Add WalletConnect if available
    const walletConnectConnector = connectorsById['walletConnect'];
    if (walletConnectConnector) {
      console.log("Found WalletConnect connector:", walletConnectConnector)
      displayConnectors.push(walletConnectConnector);
    } else {
      console.log("WalletConnect connector not found!")
    }
    
    // Add Coinbase if available
    const coinbaseConnector = connectorsById['coinbaseWallet'];
    if (coinbaseConnector) {
      console.log("Found Coinbase connector:", coinbaseConnector)
      displayConnectors.push(coinbaseConnector);
    } else {
      console.log("Coinbase connector not found!")
    }
    
    // Add any other browser wallets (injected)
    const injectedConnector = connectorsById['injected'];
    if (injectedConnector && !phantomConnector) {
      displayConnectors.push(injectedConnector);
    }
    
    // Add Safe wallet
    const safeConnector = connectorsById['safe'];
    if (safeConnector) {
      displayConnectors.push(safeConnector);
    }
    
    // Add any other connectors we might have missed
    connectors.forEach(connector => {
      if (!displayConnectors.some(c => c.id === connector.id)) {
        displayConnectors.push(connector);
      }
    });
    
    // Log final display connectors
    console.log("Final displayConnectors:", displayConnectors.map(c => ({ id: c.id, name: c.name })))
    
    return displayConnectors;
  };

  const displayConnectors = getDisplayConnectors();
  const hasCoinbaseWallet = displayConnectors.some(c => c.id === 'coinbaseWallet');
  const hasWalletConnect = displayConnectors.some(c => c.id === 'walletConnect');
  
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
          
          <div className="grid gap-3 py-3 max-h-[60vh] overflow-y-auto">            
            {/* Display all connectors with our custom ordering */}
            {displayConnectors.map((connector) => (
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
                </div>
                {isConnecting && selectedConnector === connector.id && (
                  <MousePointerClick className="ml-auto animate-pulse h-4 w-4" />
                )}
              </Button>
            ))}
            
            {/* Add direct WalletConnect option if not already in the list */}
            {!hasWalletConnect && (
              <Button
                variant={selectedConnector === 'walletConnect' ? "default" : "outline"}
                className="w-full justify-start h-14 px-3 md:px-4"
                disabled={isPending || (isConnecting && selectedConnector !== 'walletConnect')}
                onClick={() => handleConnectDirect('walletConnect')}
              >
                <div className="mr-3 flex items-center justify-center w-8 h-8">
                  <WalletIcon connectorId="walletConnect" name="WalletConnect" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">WalletConnect</span>
                </div>
                {isConnecting && selectedConnector === 'walletConnect' && (
                  <MousePointerClick className="ml-auto animate-pulse h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Add direct Coinbase Wallet option if not already in the list */}
            {!hasCoinbaseWallet && (
              <Button
                variant={selectedConnector === 'coinbaseWallet' ? "default" : "outline"}
                className="w-full justify-start h-14 px-3 md:px-4"
                disabled={isPending || (isConnecting && selectedConnector !== 'coinbaseWallet')}
                onClick={() => handleConnectDirect('coinbase')}
              >
                <div className="mr-3 flex items-center justify-center w-8 h-8">
                  <WalletIcon connectorId="coinbaseWallet" name="Coinbase Wallet" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Coinbase Wallet</span>
                </div>
                {isConnecting && selectedConnector === 'coinbaseWallet' && (
                  <MousePointerClick className="ml-auto animate-pulse h-4 w-4" />
                )}
              </Button>
            )}
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