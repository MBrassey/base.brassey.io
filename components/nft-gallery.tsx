"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import { Alchemy, Network, OwnedNft } from "alchemy-sdk"

// Contract addresses for special handling
const CHART_CONTRACT_ADDRESS = "0xb679683E562b183161d5f3F93c6fA1d3115c4D30"
const CHART_PREVIEW_URL = "https://charts-by-jvmi-jet.vercel.app/?values=[30,9,57,99,79,51,63]&palette=blue"

export function NFTGallery() {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<OwnedNft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) {
        setLoading(false)
        return
      }

      try {
        const config = {
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
          network: Network.BASE_MAINNET,
        }
        const alchemy = new Alchemy(config)

        const response = await alchemy.nft.getNftsForOwner(address)
        if (response.ownedNfts.length > 0) {
          console.log("First NFT metadata:", response.ownedNfts[0])
        }
        setNfts(response.ownedNfts)
        setError(null)
      } catch (err) {
        console.error("Error fetching NFTs:", err)
        setError("Failed to load NFTs")
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [address])

  if (!address) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Filter out NFTs that would display as "Untitled" with "No description"
  const filteredNfts = nfts.filter(nft => {
    // Special case NFTs should always be shown
    if (
      (nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()) ||
      (nft.contract.name === "Basenames") || 
      (nft.contract.name?.includes("Basename")) ||
      (nft.raw?.metadata?.name?.includes("Basename"))
    ) {
      return true;
    }
    
    // Has a proper name
    const hasName = nft.name || nft.raw?.metadata?.name;
    
    // Has a proper description
    const hasDescription = nft.description || nft.raw?.metadata?.description;
    
    // Show only if it has either a name or description
    return hasName || hasDescription;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredNfts.length === 0 ? (
          <p className="text-muted-foreground">No NFTs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredNfts.map((nft) => {
              console.log("NFT metadata:", nft)
              
              // Check if this is a chart NFT
              const isChartNFT = nft.contract.address.toLowerCase() === CHART_CONTRACT_ADDRESS.toLowerCase()
              
              // Check if this is a Basename NFT (by name or contract)
              const isBasenameNFT = 
                (nft.contract.name === "Basenames") || 
                (nft.contract.name?.toLowerCase().includes("basename")) ||
                (nft.raw?.metadata?.name?.toLowerCase()?.includes("basename")) ||
                (nft.tokenId && nft.name?.toLowerCase().includes(".base"));
              
              // For chart NFTs, use the specific preview URL and ensure it's interactive
              if (isChartNFT) {
                return (
                  <div
                    key={`${nft.contract.address}-${nft.tokenId}`}
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
                return (
                  <div
                    key={`${nft.contract.address}-${nft.tokenId}`}
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
                        {nft.name || (nft.tokenId ? `Basename #${nft.tokenId}` : "Basename")}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {nft.description || "Base Name Service"}
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
                nft.image?.originalUrl?.endsWith('.svg') || 
                nft.image?.cachedUrl?.endsWith('.svg') ||
                nft.raw?.metadata?.image?.endsWith('.svg') ||
                nft.raw?.metadata?.animation_url?.endsWith('.svg')
              
              const isInteractiveWeb = 
                nft.image?.originalUrl?.includes('?') ||
                nft.image?.cachedUrl?.includes('?') ||
                nft.raw?.metadata?.image?.includes('?') ||
                nft.raw?.metadata?.animation_url?.includes('?')
              
              const imageUrl = 
                nft.image?.cachedUrl || 
                nft.image?.originalUrl || 
                nft.raw?.metadata?.image ||
                nft.raw?.metadata?.animation_url ||
                "/placeholder.png"
              
              return (
                <div
                  key={`${nft.contract.address}-${nft.tokenId}`}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-48 relative">
                    {(isSvg || isInteractiveWeb) ? (
                      <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
                        <iframe
                          src={imageUrl}
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          title={nft.name || "NFT"}
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
                        alt={nft.name || "NFT"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading image:", imageUrl)
                          e.currentTarget.src = "/placeholder.png"
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">
                      {nft.name || "Untitled"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {nft.description || "No description"}
                    </p>
                    {nft.contract.name && (
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