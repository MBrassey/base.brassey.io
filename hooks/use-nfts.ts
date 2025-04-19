"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import type { OwnedNft } from "alchemy-sdk"
import { useMemo } from "react"

// Extended NFT type with additional fields from our API
export interface ExtendedNft extends OwnedNft {
  id?: {
    tokenId: string;
    tokenMetadata?: {
      tokenType?: string;
    };
  };
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

  const query = useQuery({
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
    enabled: !!address,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache data for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Only refetch on mount if data is stale
    refetchOnMount: true,
    // Only refetch on window focus if data is stale
    refetchOnWindowFocus: false,
    // Add retry options
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (1.5 ** attemptIndex), 30000),
    // Remove automatic refetch interval
    refetchInterval: 0,
    // Don't refetch in background
    refetchIntervalInBackground: false,
  })
  
  // Process the NFTs to add the isBasename flag
  const processedData = useMemo(() => {
    if (!query.data) return undefined
    
    const nftsWithBasenameFlag = query.data.nfts.map((nft: ExtendedNft) => {
      // Check if this is a Basename NFT
      const isBasename = 
        // Check contract addresses (case insensitive)
        BASENAME_CONTRACT_ADDRESSES.includes(nft.contract.address.toLowerCase()) ||
        // Check contract name variations
        (nft.contract.name === "Basenames") || 
        (nft.contract.name === "Base Name Service") ||
        (nft.contract.name?.toLowerCase()?.includes("basename")) ||
        // Check metadata name variations
        (nft.raw?.metadata?.name?.toLowerCase()?.includes("basename")) ||
        // Check for .base in any name field
        (nft.name?.toLowerCase()?.endsWith(".base")) ||
        (nft.raw?.metadata?.name?.toLowerCase()?.endsWith(".base")) ||
        (nft.title?.toLowerCase()?.endsWith(".base")) ||
        // Check for attributes
        (Array.isArray(nft.raw?.metadata?.attributes) && 
          nft.raw?.metadata?.attributes.some((attr: any) => 
            (attr.trait_type?.toLowerCase()?.includes('basename') || 
             attr.trait_type?.toLowerCase()?.includes('base name') ||
             (attr.value && attr.value.toString()?.toLowerCase()?.endsWith('.base'))
            )
          )
        ) ||
        // Check description for Base Name Service mentions
        (nft.description?.toLowerCase()?.includes("base name service")) ||
        (nft.raw?.metadata?.description?.toLowerCase()?.includes("base name service"));
      
      // For Base Name NFTs, enhance the metadata
      if (isBasename) {
        // Extract the actual basename (e.g. "example.base")
        let basename = null;
        const possibleNames = [
          nft.name,
          nft.raw?.metadata?.name,
          nft.title,
          nft.raw?.metadata?.title,
          // Also check attributes for the basename
          ...(Array.isArray(nft.raw?.metadata?.attributes) 
            ? nft.raw.metadata.attributes
                .filter((attr: any) => attr.value?.toString().toLowerCase().endsWith('.base'))
                .map((attr: any) => attr.value)
            : [])
        ].filter(Boolean); // Remove null/undefined values

        // Find the first name that ends with .base
        basename = possibleNames.find(name => 
          name && typeof name === 'string' && name.toLowerCase().endsWith('.base')
        );

        // If no direct .base name found, try to extract from "Basename: name.base" format
        if (!basename) {
          const nameWithPrefix = possibleNames.find(name =>
            name && typeof name === 'string' && name.toLowerCase().includes('basename:')
          );
          if (nameWithPrefix) {
            const match = nameWithPrefix.match(/basename:\s*(.+\.base)/i);
            if (match && match[1]) {
              basename = match[1].trim();
            }
          }
        }

        // If still no basename found but we have a tokenId, create a placeholder
        if (!basename && nft.tokenId) {
          basename = `Basename #${nft.tokenId}`;
        }

        // Enhance the NFT object with clean basename data
        return {
          ...nft,
          isBasename,
          name: basename || nft.name,
          title: basename || nft.title,
          description: nft.description || nft.raw?.metadata?.description || "Base Name Service",
          contract: {
            ...nft.contract,
            name: "Base Name Service"
          },
          // Add raw metadata if missing
          raw: {
            ...nft.raw,
            metadata: {
              ...nft.raw?.metadata,
              name: basename || nft.raw?.metadata?.name,
              description: nft.raw?.metadata?.description || "Base Name Service"
            }
          }
        };
      }
      
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