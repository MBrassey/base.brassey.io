"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import { Alchemy, Network, OwnedNft } from "alchemy-sdk"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <p className="text-muted-foreground">No NFTs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft) => {
              const isSvg = nft.image?.originalUrl?.endsWith('.svg') || nft.image?.cachedUrl?.endsWith('.svg')
              const imageUrl = nft.image?.cachedUrl || nft.image?.originalUrl || "/placeholder.png"
              
              return (
                <div
                  key={`${nft.contract.address}-${nft.tokenId}`}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-48 relative">
                    {isSvg ? (
                      <iframe
                        src={imageUrl}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                        title={nft.name || "NFT"}
                      />
                    ) : (
                      <img
                        src={imageUrl}
                        alt={nft.name || "Untitled"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
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