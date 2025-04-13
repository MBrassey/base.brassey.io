"use client"

import React, { useEffect, useState } from 'react'
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { useWalletConfig } from '@/hooks/use-wallet-config'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Create a client for react-query
const queryClient = new QueryClient()

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

  // Create a default config to avoid QueryClient errors
  const defaultConfig = createConfig({
    chains: [mainnet, base],
    transports: {
      [mainnet.id]: http(),
      [base.id]: http(),
    },
    // If in logout process, don't initialize any connectors
    connectors: isDisconnectInProgress ? [] : [metaMask()],
  });

  useEffect(() => {
    // Ensure window.global is defined for wallet connectors
    if (typeof window !== 'undefined') {
      window.process = window.process || { env: {} };
      window.global = window;
    }

    // Try to use the env var first, fallback to API response, finally use hardcoded fallback
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                      walletConnectProjectId || 
                      fallbackProjectId;
    
    // Only create the config if we have the project ID and not in logout process
    if (projectId && !isDisconnectInProgress) {
      try {
        const wagmiConfig = createConfig({
          chains: [mainnet, base],
          transports: {
            [mainnet.id]: http(),
            [base.id]: http(),
          },
          connectors: [
            metaMask(),
            coinbaseWallet({
              appName: "base.brassey.io",
              headlessMode: false,
              appLogoUrl: "https://base.brassey.io/base-logo.svg",
            }),
            walletConnect({
              projectId,
              showQrModal: true,
              metadata: {
                name: "base.brassey.io",
                description: "Base Name Service",
                url: "https://base.brassey.io",
                icons: ["https://base.brassey.io/base-logo.svg"]
              }
            }),
          ],
        });
        
        setConfig(wagmiConfig);
      } catch (err) {
        console.error("Error creating wagmi config:", err);
      }
    }
  }, [walletConnectProjectId]);

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

  // If error or no config, use the default config
  const finalConfig = config || defaultConfig;

  return (
    <WagmiProvider config={finalConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 