"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

// Token interface
export interface TokenData {
  contractAddress: string
  balance: string
  name: string
  symbol: string
  logo: string | null
  decimals: number
}

export function useTokens() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["tokens", address],
    queryFn: async () => {
      if (!address) {
        return { tokens: [] }
      }

      const response = await fetch(`/api/tokens?address=${address}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return response.json()
    },
    // Enable the query only when we have an address
    enabled: !!address,
    // Keep data fresh for 2 minutes, then consider it stale
    staleTime: 2 * 60 * 1000,
    // Always refetch on mount to ensure data is fresh
    refetchOnMount: true,
    // Refetch when coming back to the app
    refetchOnWindowFocus: true,
    // Add retry options
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (1.5 ** attemptIndex), 10000),
  })
} 