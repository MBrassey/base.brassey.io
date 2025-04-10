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

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { walletConnectProjectId, isLoading, error } = useWalletConfig()
  const [config, setConfig] = useState<ReturnType<typeof createConfig> | null>(null)

  useEffect(() => {
    // Try to use the env var directly first, then fallback to API
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || walletConnectProjectId
    
    // Only create the config once we have the project ID
    if (projectId) {
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
      })
      
      setConfig(wagmiConfig)
    }
  }, [walletConnectProjectId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-red-500 mb-2">Failed to load wallet configuration</p>
            <p className="text-sm text-muted-foreground">Please refresh and try again</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 