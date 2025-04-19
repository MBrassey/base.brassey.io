"use client"

import type React from "react"
import { Config, createConfig, http } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { useEffect, useState } from "react"
import { base } from "wagmi/chains"
import { WagmiProvider } from "wagmi"

// Check if we're in the browser and if a disconnect is in progress
const isDisconnectInProgress = 
  typeof window !== 'undefined' && 
  (window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS') === 'true' ||
   window.location.href.includes('logout=true'));

// Create wagmi config with full connectors or no connectors based on logout state
const config: Config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: isDisconnectInProgress 
    ? [] // Don't initialize any connectors if we're in the middle of a disconnect
    : [
      injected(),
      coinbaseWallet({
        appName: "base.brassey.io",
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
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

export function CustomWagmiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for disconnect in progress
    const checkDisconnectState = () => {
      if (typeof window !== 'undefined') {
        const disconnectInProgress = sessionStorage.getItem("WALLET_DISCONNECT_IN_PROGRESS");
        setIsDisconnecting(!!disconnectInProgress);
      }
    };

    // Initial check
    checkDisconnectState();

    // Set up storage event listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "WALLET_DISCONNECT_IN_PROGRESS") {
        checkDisconnectState();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  const queryClient = new QueryClient();

  // Initialize wagmi config
  const wagmiConfig = createConfig({
    chains: [base],
    connectors: isDisconnecting ? [] : [
      injected(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
        metadata: {
          name: "Base Name Service",
          description: "Base Name Service",
          url: "https://base.brassey.io",
          icons: ["https://base.brassey.io/favicon.ico"],
        },
      }),
      coinbaseWallet({
        appName: "Base Name Service",
      }),
    ],
    transports: {
      [base.id]: http(),
    },
  });

  // Handle WalletConnect errors during logout
  useEffect(() => {
    if (isDisconnecting) {
      const handleWalletConnectError = (event: ErrorEvent) => {
        if (event.error?.message?.includes('WalletConnect')) {
          event.preventDefault();
          console.log('Suppressing WalletConnect error during disconnect');
        }
      };

      window.addEventListener('error', handleWalletConnectError);
      return () => window.removeEventListener('error', handleWalletConnectError);
    }
  }, [isDisconnecting]);

  return mounted ? (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  ) : null;
}
