import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if API key exists - use private server-side env var
    // This works in both local and deployed environments
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error("Missing Alchemy API key");
      return NextResponse.json(
        { error: "Missing API key configuration" },
        { status: 500 }
      );
    }

    const url = `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
    
    console.log("Fetching block number via JSON-RPC...");
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
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result) {
      // Convert hex to decimal
      const blockNumber = parseInt(data.result, 16);
      console.log("Block number fetched:", blockNumber);
      return NextResponse.json({ blockNumber });
    } else {
      console.error("Invalid response:", data);
      return NextResponse.json(
        { error: "Invalid response from Alchemy API", details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching block height:", error);
    return NextResponse.json(
      { error: "Failed to fetch block height", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 