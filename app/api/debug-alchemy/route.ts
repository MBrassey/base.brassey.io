import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get API key from environment
    const apiKey = process.env.ALCHEMY_API_KEY;
    
    // Check if API key exists
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Alchemy API key in environment" },
        { status: 500 }
      );
    }
    
    // Log first and last few characters of the key (for debugging)
    const keyLength = apiKey.length;
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(keyLength - 4)}`;
    
    // Make a simple request to Alchemy
    const url = `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_blockNumber"
      }),
      cache: 'no-store'
    });
    
    // Check response status
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `Alchemy API error: ${response.status}`, 
          keyInfo: {
            length: keyLength,
            prefix: maskedKey
          }
        },
        { status: response.status }
      );
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      success: true,
      blockNumber: parseInt(data.result, 16),
      keyInfo: {
        length: keyLength,
        prefix: maskedKey
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "API test failed", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 