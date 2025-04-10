import { NextResponse } from 'next/server'
import { Alchemy, Network } from 'alchemy-sdk'

// Ensure we have the API key from environment variables
const alchemyApiKey = process.env.ALCHEMY_API_KEY
if (!alchemyApiKey) {
  console.error("ALCHEMY_API_KEY is not set in environment variables")
}

// Base Alchemy API URL
const BASE_ALCHEMY_URL = 'https://base-mainnet.g.alchemy.com/v2/'

// Configure Alchemy with fixed settings
const config = {
  apiKey: alchemyApiKey,
  network: Network.BASE_MAINNET,
}

// Initialize Alchemy SDK
let alchemy: Alchemy | null = null
try {
  alchemy = new Alchemy(config)
} catch (error) {
  console.error("Failed to initialize Alchemy SDK:", error)
}

// Common Base ERC-20 tokens metadata
const tokenMetadata: Record<string, { name: string, symbol: string, logo?: string, decimals: number }> = {
  // Base USDC
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    name: "USD Coin",
    symbol: "USDC",
    logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    decimals: 6
  },
  // Base DAI
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": {
    name: "Dai Stablecoin",
    symbol: "DAI",
    logo: "https://assets.coingecko.com/coins/images/9956/small/4943.png",
    decimals: 18
  },
  // WETH on Base
  "0x4200000000000000000000000000000000000006": {
    name: "Wrapped Ether",
    symbol: "WETH",
    logo: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    decimals: 18
  },
  // BALD
  "0x27d2decb4bfc9c76f0309b8e88dec3a601fe25a8": {
    name: "Bald",
    symbol: "BALD",
    logo: "https://assets.coingecko.com/coins/images/31502/small/bald-token-200x200.png",
    decimals: 18
  },
  // tBTC
  "0x236aa50979d5f3de3bd1eeb40e81137f22ab794b": {
    name: "tBTC",
    symbol: "tBTC",
    logo: "https://assets.coingecko.com/coins/images/25767/small/tBTC.png",
    decimals: 18
  },
  // SSTO (StakeStone)
  "0xb46e0ae620efd98516f49bb00f42926d2efb6c57": {
    name: "StakeStone",
    symbol: "SSTO",
    logo: "https://stake.stone/favicon.svg",
    decimals: 18
  },
  // Bridged USDC.e
  "0x176211869ca2b568f2a7d4ee941e073a821ee1ff": {
    name: "Bridged USDC",
    symbol: "USDC.e",
    logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    decimals: 6
  }
}

// Function to fetch token balances directly without using SDK
async function fetchTokenBalances(address: string) {
  try {
    const response = await fetch(`${BASE_ALCHEMY_URL}${alchemyApiKey}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [address]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Alchemy API error:', data.error);
      return [];
    }
    
    console.log(`Found ${data.result?.tokenBalances?.length || 0} tokens via direct Alchemy API`);
    
    return data.result?.tokenBalances || [];
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}

// Function to get token metadata
async function getTokenMetadata(tokenAddress: string) {
  // First check our local cache
  const cachedMetadata = tokenMetadata[tokenAddress.toLowerCase()];
  if (cachedMetadata) {
    return cachedMetadata;
  }
  
  // Otherwise fetch from Alchemy
  try {
    if (!alchemy) return null;
    
    const metadata = await alchemy.core.getTokenMetadata(tokenAddress);
    return {
      name: metadata?.name || 'Unknown Token',
      symbol: metadata?.symbol || '???',
      logo: metadata?.logo || null,
      decimals: metadata?.decimals || 18
    };
  } catch (error) {
    console.error(`Error fetching metadata for token ${tokenAddress}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    console.log(`Fetching token balances for address: ${address}`)
    
    // Fetch token balances directly to avoid SDK referrer issues
    const tokenBalances = await fetchTokenBalances(address);
    
    // Process the tokens that have non-zero balances
    const tokensWithMetadata = await Promise.all(
      tokenBalances
        .filter((token: any) => {
          // Skip tokens with 0x0 balance or '0' balance
          const balance = token.tokenBalance;
          if (balance === '0x0' || balance === '0') {
            return false;
          }
          
          // Convert hex balance to decimal to check if actually 0
          if (balance.startsWith('0x')) {
            const decimalBalance = BigInt(balance);
            if (decimalBalance === BigInt(0)) {
              return false;
            }
          }
          
          return true;
        })
        .map(async (token: any) => {
          const metadata = await getTokenMetadata(token.contractAddress);
          
          return {
            contractAddress: token.contractAddress,
            balance: token.tokenBalance,
            name: metadata?.name || 'Unknown Token',
            symbol: metadata?.symbol || '???',
            logo: metadata?.logo || null,
            decimals: metadata?.decimals || 18
          };
        })
    );
    
    // Final filter to remove any remaining "Unknown Token" entries with no useful data
    const filteredTokens = tokensWithMetadata.filter(token => {
      // Skip unknown tokens with no useful information
      if (token.name === 'Unknown Token' && token.symbol === '???') {
        return false;
      }
      return true;
    });
    
    console.log(`Returning ${filteredTokens.length} tokens with metadata`);
    return NextResponse.json({ tokens: filteredTokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ tokens: [] });
  }
} 