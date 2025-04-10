import { NextResponse } from 'next/server'
import { Alchemy, Network } from 'alchemy-sdk'

// Get API key from environment variables
const alchemyApiKey = process.env.ALCHEMY_API_KEY
if (!alchemyApiKey) {
  console.error("ALCHEMY_API_KEY is not set in environment variables")
}

// Configure Alchemy with fixed settings
const config = {
  apiKey: alchemyApiKey,
  network: Network.BASE_MAINNET,
}

// Custom fetch function to avoid referrer issues
const customFetch = (url: string, options: RequestInit) => {
  const customOptions = {
    ...options,
    headers: {
      ...options.headers,
      "Referrer-Policy": "no-referrer",
      "Origin": "https://base.brassey.io"
    }
  };
  return fetch(url, customOptions);
};

// Initialize Alchemy SDK
let alchemy: Alchemy | null = null
try {
  // @ts-ignore - customizing fetch
  config.customFetch = customFetch;
  alchemy = new Alchemy(config)
} catch (error) {
  console.error("Failed to initialize Alchemy SDK:", error)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  // Check if Alchemy is properly initialized
  if (!alchemy || !alchemyApiKey) {
    console.warn("Alchemy SDK not initialized or API key missing")
    return NextResponse.json({ nfts: [] })
  }

  try {
    // Add a timeout to the Alchemy API call
    const nftsPromise = alchemy.nft.getNftsForOwner(address)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Alchemy API request timed out')), 10000)
    })

    // Use Promise.race to implement timeout
    const nfts = await Promise.race([nftsPromise, timeoutPromise]) as any
    
    return NextResponse.json({ nfts: nfts.ownedNfts })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json({ nfts: [] })
  }
} 