"use client"

import React, { useEffect, useState } from 'react'
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet, walletConnect, injected, safe } from "wagmi/connectors"
import { useWalletConfig } from '@/hooks/use-wallet-config'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Create a client for react-query with better persistence options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Always refetch on mount to ensure fresh data
      refetchOnMount: true,
      // Refetch when coming back to the app
      refetchOnWindowFocus: true,
      // Add retry options
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * (1.5 ** attemptIndex), 30000),
      // Keep refetching in background
      refetchInterval: 30000,
      refetchIntervalInBackground: true,
    },
  },
})

// Check if we're in the browser and if a disconnect is in progress
const isDisconnectInProgress = 
  typeof window !== 'undefined' && 
  (window.sessionStorage.getItem('WALLET_DISCONNECT_IN_PROGRESS') === 'true' ||
   window.location.href.includes('logout=true'));

// Default fallback project ID - only used if API call fails
const fallbackProjectId = '891aaf3e0e3c9c7ca427dfe291ac3ec4';

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { walletConnectProjectId, isLoading, error } = useWalletConfig()
  const [config, setConfig] = useState<ReturnType<typeof createConfig> | null>(null)

  useEffect(() => {
    // Clear any disconnect flags that might have persisted
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('WALLET_DISCONNECT_IN_PROGRESS');
    }

    // Ensure window.global is defined for wallet connectors
    if (typeof window !== 'undefined') {
      window.process = window.process || { env: {} };
      window.global = window;
    }

    // Only create the config if not in logout process
    if (!isDisconnectInProgress) {
      try {
        // Create generic injected connector that will work with any browser wallet
        const genericInjected = injected()

        // Create specifically named metamask connector
        const metamaskConnector = metaMask()

        const wagmiConfig = createConfig({
          chains: [mainnet, base],
          transports: {
            [mainnet.id]: http(),
            [base.id]: http(),
          },
          connectors: [
            metamaskConnector,
            coinbaseWallet({
              appName: "base.brassey.io",
              headlessMode: false,
              appLogoUrl: "https://base.brassey.io/base-logo.svg",
              preference: "all",
            }),
            walletConnect({
              projectId: fallbackProjectId,
              showQrModal: true,
              metadata: {
                name: "base.brassey.io",
                description: "Base Name Service",
                url: "https://base.brassey.io",
                icons: ["https://base.brassey.io/base-logo.svg"]
              }
            }),
            genericInjected,
            safe(),
          ],
        });
        
        setConfig(wagmiConfig);
      } catch (err) {
        console.error("Error creating wagmi config:", err);
      }
    }
  }, []);

  // If loading, show a skeleton UI
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-80">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
      </QueryClientProvider>
    )
  }

  return (
    <WagmiProvider config={config || createConfig({
      chains: [mainnet, base],
      transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
      },
      connectors: isDisconnectInProgress ? [] : [
        metaMask(),
        coinbaseWallet({
          appName: "base.brassey.io",
          headlessMode: false,
          appLogoUrl: "https://base.brassey.io/base-logo.svg",
          preference: "all",
        }),
        walletConnect({
          projectId: fallbackProjectId,
          showQrModal: true,
          metadata: {
            name: "base.brassey.io",
            description: "Base Name Service",
            url: "https://base.brassey.io",
            icons: ["https://base.brassey.io/base-logo.svg"]
          }
        }),
        injected(),
        safe(),
      ],
    })}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 