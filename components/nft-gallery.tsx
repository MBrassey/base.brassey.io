"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import type { OwnedNft } from "alchemy-sdk"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useNFTs, ExtendedNft as NFT } from "@/hooks/use-nfts"
import { useEffect } from "react"
import Image from "next/image"

// Contract addresses for special handling
const CHART_CONTRACT_ADDRESS = "0xb679683E562b183161d5f3F93c6fA1d3115c4D30"
const CHART_PREVIEW_URL = "https://charts-by-jvmi-jet.vercel.app/?values=[30,9,57,99,79,51,63]&palette=blue"

export function NFTGallery() {
  const { address } = useAccount()
  const { data, isLoading, isError, error, refetch } = useNFTs()
  const nfts = data?.nfts || [] as NFT[]

  // Force refetch on mount and handle reconnection
  useEffect(() => {
    if (address) {
      // First immediate refetch
      refetch()
      
      // Staggered refetches to ensure data loads properly
      const timeouts = [500, 1500, 3000].map(delay => 
        setTimeout(() => {
          if (address) {  // Only refetch if still connected
            refetch()
          }
        }, delay)
      )
      
      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        if (address) {
          refetch()
        }
      }, 30000) // Refresh every 30 seconds
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
        clearInterval(refreshInterval)
      }
    }
  }, [address, refetch])

  // Add event listener for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [address, refetch])

  if (!address) {
    return null
  }

  // Debug any Basename NFTs to console
  const basenameNfts = nfts.filter((nft: NFT) => nft.isBasename === true);
  
  console.log("Found Basename NFTs:", basenameNfts.map((nft: NFT) => ({
    address: nft.contract.address,
    name: nft.name || nft.raw?.metadata?.name || "No name",
    tokenId: nft.tokenId || "No ID",
    isBasename: nft.isBasename
  })));
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner className="h-8 w-8 mb-4" />
            <p className="text-muted-foreground">Loading NFTs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load NFTs"}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter out NFTs that would display as "Untitled" with "No description"
  const filteredNfts = nfts.filter((nft: NFT) => {
    // Debug logging for NFTs with missing data
    if (!nft.name && !nft.tokenId) {
      console.log("NFT with missing data:", {
        contract: nft.contract,
        tokenId: nft.tokenId,
        name: nft.name,
        raw: nft.raw,
        metadata: nft.metadata,
        title: nft.title,
        isBasename: nft.isBasename
      });
    }
    
    // Always show Base Name NFTs
    if (nft.isBasename === true) {
      return true;
    }
    
    // Special case NFTs should always be shown
    if (nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()) {
      return true;
    }
    
    // Show NFT if it has any identifying information
    return !!(
      nft.name || 
      nft.raw?.metadata?.name || 
      nft.title || 
      nft.metadata?.name ||
      nft.tokenId ||
      nft.contract?.name ||
      // Also check for Base Name specific identifiers
      (nft.raw?.metadata?.attributes && 
       nft.raw.metadata.attributes.some((attr: any) => 
         attr.value?.toString().toLowerCase().endsWith('.base')
       ))
    );
  });
  
  // Deduplicate NFTs only if they have the exact same contract address AND token ID
  const dedupedNfts: NFT[] = [];
  const seen = new Set<string>();
  
  filteredNfts.forEach((nft: NFT) => {
    // Create a unique identifier from contract address and tokenId
    // Only use tokenId if it exists, otherwise use a random value to ensure uniqueness
    const tokenIdPart = nft.tokenId || Math.random().toString(36).substring(2);
    const nftKey = `${nft.contract.address.toLowerCase()}-${tokenIdPart}`;
    
    // If we haven't seen this NFT before, add it to the deduplicated list
    if (!seen.has(nftKey)) {
      seen.add(nftKey);
      dedupedNfts.push(nft);
    } else {
      console.log(`Skipping duplicate NFT: ${nftKey}`);
    }
  });

  return (
    <div className="space-y-6">
      {dedupedNfts.length === 0 ? (
        <p className="text-muted-foreground">No NFTs found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {dedupedNfts.map((nft: NFT) => {
            // Check if this is a chart NFT
            const isChartNFT = nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()
            
            // For chart NFTs, use the specific preview URL and ensure it's interactive
            if (isChartNFT) {
              const uniqueKey = `chart-${nft.contract.address}-${nft.tokenId || 'id'}-${Math.random().toString(36).substring(2, 9)}`;
              const chartTitle = nft.raw?.metadata?.name || nft.name || nft.title || "$PKRM-FKZ";
              const chartDescription = nft.raw?.metadata?.description || nft.description || "charts by jvmi";
              
              return (
                <div
                  key={uniqueKey}
                  className="bg-[#111111] rounded-xl overflow-hidden border border-[#303339] hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-square relative bg-[#111111] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <iframe
                        src={CHART_PREVIEW_URL}
                        className="absolute inset-0 w-full h-full scale-[1.15]"
                        sandbox="allow-scripts allow-same-origin"
                        title={chartTitle}
                        style={{
                          border: 'none',
                          pointerEvents: 'none',
                          transformOrigin: 'center center'
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="truncate">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {chartTitle}
                        </h3>
                        <p className="text-sm text-[#8A939B] truncate">
                          {chartDescription}
                        </p>
                      </div>
                    </div>
                    {nft.contract.name && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#8A939B]">
                          {nft.contract.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            
            // Use the isBasename flag from the hook instead of checking again
            const isBasenameNFT = nft.isBasename === true;
            
            // For Basename NFTs, use the Base logo and proper metadata
            if (isBasenameNFT) {
              const uniqueKey = `basename-${nft.contract.address}-${nft.id?.tokenId || 'id'}-${Math.random().toString(36).substring(2, 9)}`;
              const displayTokenId = (nft.id?.tokenId || '').replace('0x', '');
              const description = "Basenames are a core onchain building block that enables anyone to establish their identity on Base by registering human-readable names for their address(es). They are a fully onchain solution which leverages ENS infrastructure deployed on Base.";
              
              return (
                <div
                  key={uniqueKey}
                  className="bg-[#111111] rounded-xl overflow-hidden border border-[#303339] hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-square relative bg-[#111111]">
                    <Image
                      src={nft.media?.[0]?.gateway || nft.image?.cachedUrl || ""}
                      alt="Basename NFT"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="truncate w-full text-center">
                        <p className="text-[13px] text-[#8A939B] truncate">
                          Basenames #{displayTokenId}
                        </p>
                        <p className="text-[13px] text-[#8A939B] truncate">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            
            // For non-chart NFTs, use the normal rendering logic
            const isSvg = 
              nft.media?.[0]?.gateway?.endsWith('.svg') || 
              nft.media?.[0]?.raw?.endsWith('.svg') ||
              nft.image?.originalUrl?.endsWith('.svg') || 
              nft.image?.cachedUrl?.endsWith('.svg') ||
              nft.raw?.metadata?.image?.endsWith('.svg') ||
              nft.raw?.metadata?.animation_url?.endsWith('.svg')
            
            const isInteractiveWeb = 
              nft.media?.[0]?.gateway?.includes('?') || 
              nft.media?.[0]?.raw?.includes('?') ||
              nft.image?.originalUrl?.includes('?') ||
              nft.image?.cachedUrl?.includes('?') ||
              nft.raw?.metadata?.image?.includes('?') ||
              nft.raw?.metadata?.animation_url?.includes('?')
            
            // Try to find the best image URL from multiple possible sources
            const imageUrl = 
              // First check the media array (from the updated API)
              nft.media?.[0]?.gateway || 
              nft.media?.[0]?.raw || 
              // Then try the image object
              nft.image?.cachedUrl || 
              nft.image?.originalUrl || 
              // Then try the metadata (sometimes in different locations)
              nft.raw?.metadata?.image ||
              nft.raw?.metadata?.animation_url ||
              nft.metadata?.image ||
              // Fallback to title as text if available
              (nft.title ? null : "/placeholder.svg")
            
            // Display actual NFT title from multiple possible sources
            const nftTitle = isBasenameNFT 
              ? (nft.name || nft.raw?.metadata?.name || "Basename") 
              : (nft.title || nft.name || nft.metadata?.name || nft.raw?.metadata?.name || `NFT #${nft.tokenId}`)
            
            // Get description from multiple possible sources
            const nftDescription = 
              isBasenameNFT
                ? (nft.description || nft.metadata?.description || nft.raw?.metadata?.description || "Base Name Service")
                : (nft.description || nft.metadata?.description || nft.raw?.metadata?.description || nft.contract?.name || "No description")
            
            // Create a truly unique key for this NFT
            const uniqueKey = `nft-${nft.contract?.address || 'unknown'}-${nft.tokenId || 'id'}-${Math.random().toString(36).substring(2, 9)}`;
            
            return (
              <div
                key={uniqueKey}
                className="bg-[#111111] rounded-xl overflow-hidden border border-[#303339] hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square relative">
                  {!imageUrl ? (
                    <div 
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#303339]/20 to-[#303339]/10 overflow-hidden p-4 text-center"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-white">{nftTitle}</h3>
                        <p className="text-xs text-[#8A939B] mt-2">
                          {nft.contract?.name || (isBasenameNFT ? "Basenames" : "Unknown Collection")}
                        </p>
                        <div className="mt-3 text-xs px-2 py-1 bg-[#303339]/20 rounded-full inline-block text-[#8A939B]">
                          {isBasenameNFT 
                            ? "Basename" 
                            : `#${nft.tokenId || "??"}`}
                        </div>
                      </div>
                    </div>
                  ) : (isSvg || isInteractiveWeb) ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#111111]">
                      <iframe
                        src={imageUrl}
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin"
                        title={nftTitle}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          border: 'none',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto',
                          transform: isSvg ? 'scale(1.2)' : 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111111] overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={nftTitle}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error("Error loading image:", imageUrl)
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="truncate">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {nftTitle}
                      </h3>
                      <p className="text-sm text-[#8A939B] truncate">
                        {nftDescription}
                      </p>
                    </div>
                  </div>
                  {nft.contract?.name && nft.contract.name !== "Basenames" && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#8A939B]">
                        {nft.contract.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const NFTCard = ({ nft }: { nft: NFT }) => {
  const displayName = nft.title || nft.name || 'Unnamed NFT';
  const collectionName = nft.contract?.name || 'Unknown Collection';
  const description = nft.description || 'No description available';
  const imageUrl = nft.media?.[0]?.gateway || '/placeholder.png';
  const tokenId = nft.tokenId || nft.id?.tokenId || '??';

  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {displayName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {collectionName}
          </p>
          <p className="text-sm text-muted-foreground">
            Token ID: {tokenId}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};