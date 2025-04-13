import { NextResponse } from 'next/server'

// Define types for the NFT and media items
interface NftMedia {
  gateway?: string;
  raw?: string;
  [key: string]: any;
}

interface Nft {
  title?: string;
  tokenId?: string;
  contract?: {
    name?: string;
  };
  media?: NftMedia[];
  [key: string]: any;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  // Get API key from environment variables
  const alchemyApiKey = process.env.ALCHEMY_API_KEY
  if (!alchemyApiKey) {
    console.error("ALCHEMY_API_KEY is not set in environment variables")
    return NextResponse.json({ nfts: [] })
  }

  try {
    console.log(`Fetching NFTs for address: ${address}`)
    
    // Use direct fetch instead of Alchemy SDK to avoid potential issues
    // Add withMetadata=true parameter to include complete metadata
    const url = `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}/getNFTs/?owner=${address}&withMetadata=true`
    
    // Add a timeout to the fetch call using AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        signal: controller.signal,
        cache: 'no-store'
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Successfully fetched ${data.ownedNfts?.length || 0} NFTs`)
      
      // Process NFTs to ensure media and metadata are present
      const processedNfts = data.ownedNfts?.map((nft: Nft) => {
        // Make sure media URLs are absolute
        if (nft.media && Array.isArray(nft.media)) {
          nft.media = nft.media.map((item: NftMedia) => {
            if (item.gateway && !item.gateway.startsWith('http')) {
              item.gateway = `https://${item.gateway}`;
            }
            if (item.raw && !item.raw.startsWith('http')) {
              item.raw = `https://${item.raw}`;
            }
            return item;
          });
        }
        
        // Ensure names are not empty
        if (!nft.title || nft.title === "") {
          if (nft.contract?.name) {
            nft.title = `${nft.contract.name} #${nft.tokenId}`;
          } else {
            nft.title = `NFT #${nft.tokenId}`;
          }
        }
        
        return nft;
      }) || [];
      
      // Add no-cache headers to response
      const jsonResponse = NextResponse.json({ nfts: processedNfts });
      jsonResponse.headers.set('Cache-Control', 'no-store, max-age=0');
      return jsonResponse;
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        console.error('Alchemy API request timed out')
      } else {
        console.error('Error fetching NFTs:', error)
      }
      
      return NextResponse.json({ nfts: [] })
    }
  } catch (error) {
    console.error('Error in NFT API route:', error)
    return NextResponse.json({ nfts: [] })
  }
} 