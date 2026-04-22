"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createConfig, http, WagmiProvider } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet, walletConnect, injected, safe } from "wagmi/connectors"
import { useWalletConfig } from "@/hooks/use-wallet-config"

const fallbackProjectId = "891aaf3e0e3c9c7ca427dfe291ac3ec4"

function buildConnectors(projectId: string) {
  return [
    metaMask(),
    coinbaseWallet({
      appName: "base.brassey.io",
      headlessMode: false,
      appLogoUrl: "https://base.brassey.io/base-logo.svg",
      preference: "all",
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "base.brassey.io",
        description: "Base Name Service",
        url: "https://base.brassey.io",
        icons: ["https://base.brassey.io/base-logo.svg"],
      },
    }),
    injected(),
    safe(),
  ]
}

function buildConfig(projectId: string) {
  return createConfig({
    chains: [mainnet, base],
    transports: {
      [mainnet.id]: http(),
      [base.id]: http(),
    },
    connectors: buildConnectors(projectId),
  })
}

// Create the default wagmi config eagerly at module scope so wagmi can
// hydrate the persisted connection on the very first render — the prior
// implementation created it inside a useEffect, which caused a flicker
// and dropped the session between page navigations.
const defaultConfig = buildConfig(fallbackProjectId)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 1.5 ** attempt, 10_000),
      // Default to no auto-refetch — individual hooks opt in when needed.
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
})

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { walletConnectProjectId } = useWalletConfig()
  const [config, setConfig] = useState(defaultConfig)

  // Rebuild the config only if the server-provided project id differs from
  // the fallback — this preserves the already-hydrated connection otherwise.
  useEffect(() => {
    if (walletConnectProjectId && walletConnectProjectId !== fallbackProjectId) {
      setConfig(buildConfig(walletConnectProjectId))
    }
  }, [walletConnectProjectId])

  // One-time environment shim for the wallet connectors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as unknown as { process?: { env: Record<string, unknown> }; global?: Window }
      w.process = w.process || { env: {} }
      w.global = window
      // Any stale disconnect flag from a prior session
      window.sessionStorage.removeItem("WALLET_DISCONNECT_IN_PROGRESS")
    }
  }, [])

  const activeConfig = useMemo(() => config, [config])

  return (
    <WagmiProvider config={activeConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
