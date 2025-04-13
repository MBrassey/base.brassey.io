"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import type { OwnedNft } from "alchemy-sdk"
import { useMemo } from "react"

// Extended NFT type with additional fields from our API
export interface ExtendedNft extends OwnedNft {
  media?: {
    raw?: string
    gateway?: string
  }[]
  metadata?: {
    name?: string
    description?: string
    image?: string
  }
  title?: string
  isBasename?: boolean
}

// Response type
export interface NftsResponse {
  nfts: ExtendedNft[];
}

// Basename contract addresses
const BASENAME_CONTRACT_ADDRESSES = [
  "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401", // Base Mainnet
  "0x4def3d3b162e5585e5769ef959ff1a444b8e9f26", // Base Sepolia
  "0x080b5bf8f360f85d3516ce00c811082d333b4acd"  // Base Goerli
]

// Custom hook to fetch NFTs
export function useNFTs() {
  const { address } = useAccount()

  const query = useQuery<NftsResponse>({
    queryKey: ["nfts", address],
    queryFn: async () => {
      if (!address) {
        return { nfts: [] }
      }

      const response = await fetch(`/api/nfts?address=${address}`, {
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
    // Don't refetch on mount, only when address changes or manually triggered
    refetchOnMount: false,
    // Refetch when coming back to the app
    refetchOnWindowFocus: true,
  })
  
  // Process the NFTs to add the isBasename flag
  const processedData = useMemo(() => {
    if (!query.data) return undefined
    
    const nftsWithBasenameFlag = query.data.nfts.map((nft: ExtendedNft) => {
      // Check if this is a Basename NFT
      const isBasename = 
        // Check contract addresses
        BASENAME_CONTRACT_ADDRESSES.includes(nft.contract.address.toLowerCase()) ||
        // Check contract name
        (nft.contract.name === "Basenames") || 
        (nft.contract.name?.toLowerCase()?.includes("basename")) ||
        // Check metadata name
        (nft.raw?.metadata?.name?.toLowerCase()?.includes("basename")) ||
        // Check for .base in the name
        (nft.tokenId && nft.name?.toLowerCase()?.includes(".base")) ||
        (nft.tokenId && nft.raw?.metadata?.name?.toLowerCase()?.includes(".base")) ||
        // Check for attributes
        (Array.isArray(nft.raw?.metadata?.attributes) && 
          nft.raw?.metadata?.attributes.some((attr: any) => 
            (attr.trait_type?.toLowerCase()?.includes('basename') || 
             (attr.value && attr.value.toString()?.toLowerCase()?.includes('.base'))
            )
          )
        );
      
      return {
        ...nft,
        isBasename
      };
    });
    
    return {
      ...query.data,
      nfts: nftsWithBasenameFlag
    };
  }, [query.data]);

  return {
    data: processedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
} 