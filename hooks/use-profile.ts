"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { base } from "viem/chains"

export function useProfile() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      if (!address) {
        return null
      }

      // Format the address to ensure it has the 0x prefix
      const formattedAddress = address.startsWith('0x')
        ? address
        : `0x${address}`

      // For now, this is just a placeholder for future profile data fetching
      // You could expand this to fetch additional profile data from an API
      return {
        address: formattedAddress,
        formattedAddress: `${formattedAddress.substring(0, 6)}...${formattedAddress.substring(formattedAddress.length - 4)}`,
        chainId: base.id,
        chainName: base.name,
      }
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds - very short stale time for profile data
    retry: 5, // Try 5 times if the query fails
    retryDelay: (attemptIndex) => Math.min(1000 * (1.5 ** attemptIndex), 10000), // Less aggressive exponential backoff
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Always refetch on window focus
  })
} 