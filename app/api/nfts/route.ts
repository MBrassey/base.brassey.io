import { NextResponse } from 'next/server'

// Define types for the NFT and media items
interface NftMedia {
  gateway?: string;
  raw?: string;
  [key: string]: any;
}

interface NftContract {
  address: string;
  name?: string;
}

interface NftId {
  tokenId: string;
  tokenMetadata?: {
    tokenType?: string;
  };
}

interface Nft {
  contract: NftContract;
  id: NftId;
  balance?: string;
  title?: string;
  tokenUri?: {
    gateway?: string;
    raw?: string;
  };
  media?: NftMedia[];
  metadata?: any;
  timeLastUpdated?: string;
  contractMetadata?: {
    name?: string;
    symbol?: string;
    tokenType?: string;
  };
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
      const processedNfts = await Promise.all(data.ownedNfts?.map(async (nft: Nft) => {
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

        // Check if this is a Base Name NFT by contract address
        const isBasename = nft.contract && [
          "0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a", // Base Mainnet (new)
          "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401", // Base Mainnet (old)
          "0x4def3d3b162e5585e5769ef959ff1a444b8e9f26", // Base Sepolia
          "0x080b5bf8f360f85d3516ce00c811082d333b4acd"  // Base Goerli
        ].includes(nft.contract.address.toLowerCase());

        // For Base Name NFTs, ensure we have proper metadata
        if (isBasename) {
          console.log("Found Base Name NFT:", {
            contract: nft.contract.address,
            tokenId: nft.id?.tokenId,
            tokenUri: nft.tokenUri
          });

          const baseNameImageUrl = "https://www.base.org/images/basenames/contract-uri/feature-image.png";

          // Set proper metadata for Base Name NFTs
          return {
            ...nft,
            id: {
              tokenId: nft.id?.tokenId || '',
              tokenMetadata: nft.id?.tokenMetadata
            },
            title: "Basename",
            name: "Basename",
            contract: {
              ...nft.contract,
              name: "Basenames"
            },
            description: "Basenames are a core onchain building block that enables anyone to establish their identity on Base by registering human-readable names for their address(es). They are a fully onchain solution which leverages ENS infrastructure deployed on Base.",
            raw: {
              metadata: {
                name: "Basename",
                description: "Basenames are a core onchain building block that enables anyone to establish their identity on Base by registering human-readable names for their address(es). They are a fully onchain solution which leverages ENS infrastructure deployed on Base.",
                image: baseNameImageUrl
              }
            },
            media: [{
              gateway: baseNameImageUrl,
              raw: baseNameImageUrl,
              thumbnail: baseNameImageUrl
            }],
            image: {
              cachedUrl: baseNameImageUrl,
              originalUrl: baseNameImageUrl,
              thumbnailUrl: baseNameImageUrl
            },
            isBasename: true
          };
        }
        
        // For non-Base Name NFTs, ensure names are not empty
        if (!nft.title || nft.title === "") {
          if (nft.contractMetadata?.name) {
            nft.title = `${nft.contractMetadata.name} #${nft.id?.tokenId}`;
          } else {
            nft.title = `NFT #${nft.id?.tokenId}`;
          }
        }
        
        return nft;
      }) || []);
      
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