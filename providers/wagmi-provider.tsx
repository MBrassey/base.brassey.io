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

// Create a client for react-query with configured options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retry count to prevent excessive retries during logout
      refetchOnWindowFocus: false, // Disable refetch on window focus which can cause reconnection
      gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    },
  },
})

export function WagmiConfig({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [shouldEnableConnectors, setShouldEnableConnectors] = useState(!isDisconnectInProgress);

  // Handle disconnect process and URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for logout URL parameter and fresh/reload parameters
    const url = new URL(window.location.href);
    const isLogout = url.searchParams.has('logout') && url.searchParams.get('logout') === 'true';
    const isFresh = url.searchParams.has('fresh') && url.searchParams.get('fresh') === 'true';
    const isReload = url.searchParams.has('reload') && url.searchParams.get('reload') === 'true';
    
    // If any of the logout indicators are present, force disconnect
    if ((isLogout || isFresh || isReload) && !window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS')) {
      console.log("Logout/Reload detected, preventing wallet reconnection");
      window.sessionStorage.setItem('WALLET_DISCONNECT_IN_PROGRESS', 'true');
      setShouldEnableConnectors(false);
      
      // Force clear all wallet storage immediately
      Object.keys(localStorage).forEach(key => {
        if (
          key.includes('wagmi') || 
          key.includes('wallet') || 
          key.includes('walletconnect') || 
          key.includes('wc@') ||
          key.includes('connectedWallets') ||
          key.includes('coinbase') ||
          key.includes('brave') ||
          key.includes('metamask') ||
          key === 'userAddress'
        ) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all relevant session storage
      Object.keys(sessionStorage).forEach(key => {
        if (
          key.includes('wagmi') || 
          key.includes('wallet') || 
          key.includes('walletconnect') || 
          key.includes('wc@')
        ) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    setIsReady(true);
  }, []);

  // Create wagmi config with connectors only when not disconnecting
  const config = createConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
    connectors: shouldEnableConnectors 
      ? [
          injected(),
          coinbaseWallet({
            appName: "base.brassey.io",
          }),
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
          }),
        ]
      : [], // No connectors during disconnect
  });
  
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
      
      // Cleanup function
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  return isReady ? (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  ) : null;
}

export function CustomWagmiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for disconnect in progress or logout parameter
    const checkDisconnectState = () => {
      if (typeof window !== 'undefined') {
        const disconnectInProgress = sessionStorage.getItem("WALLET_DISCONNECT_IN_PROGRESS");
        const url = new URL(window.location.href);
        const isLogout = url.searchParams.has('logout') && url.searchParams.get('logout') === 'true';
        const isFresh = url.searchParams.has('fresh') && url.searchParams.get('fresh') === 'true';
        const isReload = url.searchParams.has('reload') && url.searchParams.get('reload') === 'true';
        
        if ((isLogout || isFresh || isReload) && !disconnectInProgress) {
          console.log("Logout/Reload/Fresh detected in CustomWagmiProvider");
          sessionStorage.setItem("WALLET_DISCONNECT_IN_PROGRESS", "true");
          // Clean URL
          if (isLogout) url.searchParams.delete('logout');
          if (isFresh) url.searchParams.delete('fresh');
          if (isReload) url.searchParams.delete('reload');
          window.history.replaceState({}, '', url.toString());
        }
        
        setIsDisconnecting(!!disconnectInProgress || isLogout || isFresh || isReload);
        
        // If disconnecting, clear wallet storage
        if (!!disconnectInProgress || isLogout || isFresh || isReload) {
          // Clear local storage wallet data to force disconnect
          Object.keys(localStorage).forEach(key => {
            if (
              key.includes('wagmi') || 
              key.includes('wallet') || 
              key.includes('walletconnect') || 
              key.includes('wc@') ||
              key.includes('connectedWallets') ||
              key.includes('coinbase') ||
              key.includes('brave') ||
              key.includes('metamask')
            ) {
              localStorage.removeItem(key);
            }
          });
          
          // Clear wallet-related items from sessionStorage
          Object.keys(sessionStorage).forEach(key => {
            if (
              key.includes('wagmi') || 
              key.includes('wallet') || 
              key.includes('walletconnect') || 
              key.includes('wc@')
            ) {
              sessionStorage.removeItem(key);
            }
          });
        }
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
