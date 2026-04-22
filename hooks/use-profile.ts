"use client"

import { useQuery } from "@tanstack/react-query"
import { base } from "viem/chains"
import { useAuth } from "@/context/auth-context"

export function useProfile() {
  // Read the persisted address from the auth context rather than wagmi so
  // this query resolves immediately on page load without waiting for wagmi
  // to rehydrate. Previously this would stay disabled → "loading forever"
  // on the profile page.
  const { address } = useAuth()

  return useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      if (!address) return null

      const formattedAddress = address.startsWith("0x") ? address : `0x${address}`
      return {
        address: formattedAddress,
        formattedAddress: `${formattedAddress.substring(0, 6)}...${formattedAddress.substring(formattedAddress.length - 4)}`,
        chainId: base.id,
        chainName: base.name,
      }
    },
    enabled: !!address,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
 