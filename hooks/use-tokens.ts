"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { isSpamToken } from "@/lib/spam"

// Token interface
export interface TokenData {
  contractAddress: string
  balance: string
  name: string
  symbol: string
  logo: string | null
  decimals: number
  isSpam?: boolean
}

export function useTokens() {
  // Read from the auth context (persisted in localStorage) rather than
  // wagmi's useAccount() — wagmi may not be hydrated yet on a fresh page
  // load, which stranded this query in a permanent loading state.
  const { address } = useAuth()

  return useQuery({
    queryKey: ["tokens", address],
    queryFn: async (): Promise<{ tokens: TokenData[] }> => {
      if (!address) return { tokens: [] }

      const response = await fetch(`/api/tokens?address=${address}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = (await response.json()) as { tokens: TokenData[] }
      return {
        tokens: (data.tokens ?? []).map((t) => {
          try {
            return { ...t, isSpam: isSpamToken(t) }
          } catch {
            return { ...t, isSpam: false }
          }
        }),
      }
    },
    enabled: !!address,
    staleTime: 5 * 60_000,          // data considered fresh for 5 min
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,         // no visible "flashing refresh" loop
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 6000),
  })
}
