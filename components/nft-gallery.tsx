"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import type { OwnedNft } from "alchemy-sdk"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useNFTs, ExtendedNft } from "@/hooks/use-nfts"
import { useEffect } from "react"

// Contract addresses for special handling
const CHART_CONTRACT_ADDRESS = "0xb679683E562b183161d5f3F93c6fA1d3115c4D30"
const CHART_PREVIEW_URL = "https://charts-by-jvmi-jet.vercel.app/?values=[30,9,57,99,79,51,63]&palette=blue"

export function NFTGallery() {
  const { address } = useAccount()
  const { data, isLoading, isError, error, refetch } = useNFTs()
  const nfts = data?.nfts || [] as ExtendedNft[]

  // Force refetch on mount
  useEffect(() => {
    if (address) {
      // First immediate refetch
      refetch()
      
      // Staggered refetches to ensure data loads properly
      const timeouts = [500, 1500, 3000].map(delay => 
        setTimeout(() => {
          refetch()
        }, delay)
      )
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [address, refetch])

  if (!address) {
    return null
  }

  // Debug any Basename NFTs to console
  const basenameNfts = nfts.filter(nft => nft.isBasename === true);
  
  console.log("Found Basename NFTs:", basenameNfts.map(nft => ({
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
  const filteredNfts = nfts.filter((nft: ExtendedNft) => {
    // Debug the NFT that's showing as unknown
    if (!nft.name && !nft.tokenId) {
      console.log("Potential problematic NFT:", JSON.stringify(nft, null, 2));
    }
    
    // Special case NFTs should always be shown
    if (
      (nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()) ||
      (nft.contract.name === "Basenames") || 
      (nft.contract.name?.toLowerCase()?.includes("basename")) ||
      (nft.raw?.metadata?.name?.toLowerCase()?.includes("basename")) ||
      // Check contract address against common Basename contract addresses
      (nft.contract.address.toLowerCase() === "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401") || // Base Mainnet
      (nft.contract.address.toLowerCase() === "0x4def3d3b162e5585e5769ef959ff1a444b8e9f26")    // Base Sepolia
    ) {
      return true;
    }
    
    // Has a proper name
    const hasName = nft.name || nft.raw?.metadata?.name || nft.title || nft.metadata?.name;
    
    // Has a proper description
    const hasDescription = nft.description || nft.raw?.metadata?.description || nft.metadata?.description;
    
    // Show only if it has either a name or description
    return hasName || hasDescription;
  });
  
  // Deduplicate NFTs by contract address and tokenId to prevent duplicates
  const dedupedNfts: ExtendedNft[] = [];
  const seen = new Set<string>();
  
  filteredNfts.forEach(nft => {
    // Create a unique identifier from contract address and tokenId
    const nftKey = `${nft.contract.address.toLowerCase()}-${nft.tokenId || 'unknown'}`;
    
    // If we haven't seen this NFT before, add it to the deduplicated list
    if (!seen.has(nftKey)) {
      seen.add(nftKey);
      dedupedNfts.push(nft);
    } else {
      console.log(`Skipping duplicate NFT: ${nftKey}`);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {dedupedNfts.length === 0 ? (
          <p className="text-muted-foreground">No NFTs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dedupedNfts.map((nft: ExtendedNft) => {
              // Check if this is a chart NFT
              const isChartNFT = nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()
              
              // Use the isBasename flag from the hook instead of checking again
              const isBasenameNFT = nft.isBasename === true;
              
              // For chart NFTs, use the specific preview URL and ensure it's interactive
              if (isChartNFT) {
                // Create a truly unique key for this Chart NFT
                const uniqueKey = `chart-${nft.contract.address}-${nft.tokenId || 'id'}-${Math.random().toString(36).substring(2, 9)}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full h-48 relative bg-white overflow-hidden">
                      <iframe
                        src={CHART_PREVIEW_URL}
                        className="absolute inset-0 w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                        title="Interactive Chart"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">
                        {nft.name || "Interactive Chart"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {nft.description || "Dynamic visualization"}
                      </p>
                      {nft.contract.name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {nft.contract.name}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }
              
              // For Basename NFTs, use the Base logo and proper metadata
              if (isBasenameNFT) {
                // Extract the basename info - try multiple data sources
                const basenameFull = 
                  nft.name || 
                  nft.raw?.metadata?.name || 
                  nft.title || 
                  nft.raw?.metadata?.title ||
                  null;
                
                // Try to extract a clean name
                let basenameClean = basenameFull;
                if (basenameFull && typeof basenameFull === 'string') {
                  // If it contains .base, just use that as the name
                  if (basenameFull.includes('.base')) {
                    basenameClean = basenameFull;
                  } 
                  // If it's in the format "Basename: something.base", extract the something.base part
                  else if (basenameFull.includes('Basename:')) {
                    const match = basenameFull.match(/Basename:\s*(.+)/i);
                    if (match && match[1]) {
                      basenameClean = match[1].trim();
                    }
                  }
                }
                
                // GUARANTEED display name that will never be undefined
                const displayName = basenameClean || 
                  (nft.tokenId ? `Basename #${nft.tokenId}` : "Basename");
                
                // Create a truly unique key for this NFT
                const uniqueKey = `basename-${nft.contract.address}-${nft.tokenId || 'id'}-${Math.random().toString(36).substring(2, 9)}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full h-48 relative flex items-center justify-center bg-white">
                      <div className="w-32 h-32 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 2500" className="w-full h-full">
                          <path 
                            fill="#0052FF" 
                            d="M1247.8,2500c691.6,0,1252.2-559.6,1252.2-1250C2500,559.6,1939.4,0,1247.8,0C591.7,0,53.5,503.8,0,1144.9h1655.1v210.2H0C53.5,1996.2,591.7,2500,1247.8,2500z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">
                        {displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {nft.description || nft.raw?.metadata?.description || "Base Name Service"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basenames
                      </p>
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
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-48 relative">
                    {!imageUrl ? (
                      // Text-based fallback for NFTs without images
                      <div 
                        className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden p-4 text-center"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-primary">{nftTitle}</h3>
                          <p className="text-xs text-muted-foreground mt-2">
                            {nft.contract?.name || (isBasenameNFT ? "Basenames" : "Unknown Collection")}
                          </p>
                          <div className="mt-3 text-xs px-2 py-1 bg-primary/20 rounded-full inline-block">
                            {isBasenameNFT 
                              ? "Basename" 
                              : `#${nft.tokenId || "??"}`}
                          </div>
                        </div>
                      </div>
                    ) : (isSvg || isInteractiveWeb) ? (
                      <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
                        <iframe
                          src={imageUrl}
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          title={nftTitle}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain', 
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={nftTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading image:", imageUrl)
                          // Fall back to displaying a placeholder
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = "/placeholder.svg";
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">
                      {nftTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {nftDescription}
                    </p>
                    {nft.contract?.name && nft.contract.name !== "Basenames" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {nft.contract.name}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}