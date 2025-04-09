"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"

interface NFT {
  contract: {
    address: string
  }
  id: {
    tokenId: string
  }
  title: string
  description: string
  media: {
    gateway: string
  }
}

export function NFTGallery() {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/nfts?address=${address}`)
        if (!response.ok) throw new Error('Failed to fetch NFTs')
        const data = await response.json()
        setNfts(data.nfts || [])
      } catch (err) {
        console.error('Error fetching NFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load NFTs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [address])

  if (!address) return null

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your NFTs</CardTitle>
          <CardDescription>Loading your NFT collection...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
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
          <CardTitle>Your NFTs</CardTitle>
          <CardDescription>Error loading NFTs</CardDescription>
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
        <CardTitle>Your NFTs</CardTitle>
        <CardDescription>Your Base NFT collection</CardDescription>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <p className="text-center text-muted-foreground">No NFTs found in your collection</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft) => (
              <div key={`${nft.contract.address}-${nft.id.tokenId}`} className="group relative aspect-square">
                <img
                  src={nft.media.gateway}
                  alt={nft.title}
                  className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <h3 className="font-medium">{nft.title}</h3>
                    <p className="text-sm text-gray-300">{nft.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 