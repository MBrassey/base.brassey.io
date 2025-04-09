"use client"

import type React from "react"
import { createConfig, http } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask } from "wagmi/connectors"

// Create wagmi config
const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    metaMask(), // Prioritize MetaMask
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
