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
    // Keep data fresh for 30 seconds
    staleTime: 30 * 1000,
    // Cache data for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Always refetch on mount
    refetchOnMount: 'always',
    // Refetch when coming back to the app
    refetchOnWindowFocus: true,
    // Add retry options
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * (1.5 ** attemptIndex), 30000),
    // Add refetch interval
    refetchInterval: 30000,
    // Keep refetching in background
    refetchIntervalInBackground: true,
  })
} 