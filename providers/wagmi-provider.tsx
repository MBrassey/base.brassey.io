"use client"

import type React from "react"
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"

// Create wagmi config
const config = createConfig({
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
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
