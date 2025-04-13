import { base } from "viem/chains"
import { NextRequest, NextResponse } from "next/server"

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

    // If the response is not OK, throw an error
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Coinbase API: ${response.statusText}` },
        { status: response.status }
      )
    }

    // Parse the response and return it
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in socials API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch social data", details: (error as Error).message },
      { status: 500 }
    )
  }
} 