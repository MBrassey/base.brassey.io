import { base } from "viem/chains"
import { NextRequest, NextResponse } from "next/server"

// Add cache for socials to reduce API calls
const socialsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Static social data for testing and fallback
const dummySocials = {
  "0x07b4E3A9134Bc88276e6Ff9516620755144CEC79": {
    socials: [
      {
        platform: "Twitter",
        url: "https://twitter.com/brassey",
        username: "brassey"
      },
      {
        platform: "Website",
        url: "https://brassey.io",
        username: "brassey.io"
      },
      {
        platform: "GitHub",
        url: "https://github.com/brassey",
        username: "brassey"
      }
    ]
  },
}

export async function GET(request: NextRequest) {
  try {
    // Get the address from query params
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      )
    }

    // Format address to ensure it has 0x prefix
    const formattedAddress = address.startsWith("0x")
      ? address
      : `0x${address}`
      
    // Check cache first
    const now = Date.now()
    const cachedData = socialsCache.get(formattedAddress)
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data)
    }
    
    // Check if we have dummy data
    if (dummySocials[formattedAddress as keyof typeof dummySocials]) {
      const data = dummySocials[formattedAddress as keyof typeof dummySocials]
      // Store in cache
      socialsCache.set(formattedAddress, { data, timestamp: now })
      return NextResponse.json(data)
    }

    try {
      // Make request to Coinbase Identity API
      const response = await fetch(
        `https://api.coinbase.com/identity/v1/socials?chain_id=${base.id}&address=${formattedAddress}`,
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          next: { revalidate: 60 }, // Cache for 60 seconds
        }
      )

      // If the response is not OK, try our backup approach
      if (!response.ok) {
        // Return empty object if no socials found
        const emptyData = { socials: [] }
        socialsCache.set(formattedAddress, { data: emptyData, timestamp: now })
        return NextResponse.json(emptyData)
      }

      // Parse the response and return it
      const data = await response.json()
      // Store in cache
      socialsCache.set(formattedAddress, { data, timestamp: now })
      return NextResponse.json(data)
    } catch (error) {
      // Return empty data on any error
      const emptyData = { socials: [] }
      socialsCache.set(formattedAddress, { data: emptyData, timestamp: now })
      return NextResponse.json(emptyData)
    }
  } catch (error) {
    console.error("Error in socials API route:", error)
    return NextResponse.json(
      { socials: [] },
      { status: 200 }
    )
  }
} 