"use client"

import type React from "react"
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { useEffect } from "react"

// Check if we're in the browser and if a disconnect is in progress
const isDisconnectInProgress = 
  typeof window !== 'undefined' && 
  (window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS') === 'true' ||
   window.location.href.includes('logout=true'));

// Create wagmi config with full connectors or no connectors based on logout state
const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors: isDisconnectInProgress 
    ? [] // Don't initialize any connectors if we're in the middle of a disconnect
    : [
      metaMask(),
      coinbaseWallet({
        appName: "base.brassey.io",
        headlessMode: false,
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || '891aaf3e0e3c9c7ca427dfe291ac3ec4',
        showQrModal: true,
        metadata: {
          name: "base.brassey.io",
          description: "Base Name Service",
          url: "https://base.brassey.io",
          icons: ["https://base.brassey.io/base-logo.svg"]
        }
      }),
    ],
})

// Create a client for react-query
const queryClient = new QueryClient()

export function WagmiConfig({ children }: { children: React.ReactNode }) {
  // Add error handling and cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Global error handling for WalletConnect errors
      const originalConsoleError = console.error;
      console.error = function(...args) {
        // Suppress WalletConnect errors during logout
        if (
          args[0] && 
          (String(args[0]).includes('walletconnect') || 
           String(args[0]).includes('WalletConnect'))
        ) {
          // Mark as having a WalletConnect error
          window.sessionStorage.setItem('WALLETCONNECT_ERROR', 'true');
          // If we're in logout process, don't show the error
          if (window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS') === 'true') {
            return; // Don't log WalletConnect errors during logout
          }
        }
        return originalConsoleError.apply(console, args);
      };
      
      // Clean up the disconnect flag after a load
      if (window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS') === 'true') {
        window.sessionStorage.removeItem('WALLET_DISCONNECT_IN_PROGRESS');
      }
      
      // Cleanup function
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
