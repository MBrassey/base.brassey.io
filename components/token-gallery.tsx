"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import { Spinner } from "@/components/ui/spinner"
import { ExternalLink, AlertCircle, Coins } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useTokens, type TokenData } from "@/hooks/use-tokens"
import { useEffect } from "react"

// CSS for the pulsating glow animation
const pulsateCSS = `
@keyframes pulsate {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 82, 255, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 82, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 82, 255, 0);
  }
}

.balance-pulsate {
  animation: pulsate 1.5s infinite;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  display: inline-block;
}
`;

export function TokenGallery() {
  const { address } = useAccount()
  const { data, isLoading, isError, error, refetch } = useTokens()
  const tokens = data?.tokens || []

  // Force refetch on mount and handle reconnection
  useEffect(() => {
    if (address) {
      // First immediate refetch
      refetch()
      
      // Staggered refetches to ensure data loads properly
      const timeouts = [500, 1500, 3000].map(delay => 
        setTimeout(() => {
          if (address) {  // Only refetch if still connected
            refetch()
          }
        }, delay)
      )
      
      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        if (address) {
          refetch()
        }
      }, 30000) // Refresh every 30 seconds
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
        clearInterval(refreshInterval)
      }
    }
  }, [address, refetch])

  // Add event listener for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [address, refetch])

  // Format token balance based on decimals
  const formatTokenBalance = (balance: string, decimals: number) => {
    try {
      const divisor = BigInt(10 ** decimals);
      const bigIntBalance = BigInt(balance);
      
      // Integer division for the whole number part
      const integerPart = bigIntBalance / divisor;
      // Modulo to get remainder (fractional part)
      const fractionalPart = bigIntBalance % divisor;
      
      // Convert to string with proper formatting
      let result = integerPart.toString();
      
      // Only add decimal part if it's not zero
      if (fractionalPart > 0) {
        // Convert to string and pad with leading zeros
        let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        
        // Trim trailing zeros
        fractionalStr = fractionalStr.replace(/0+$/, '');
        
        if (fractionalStr.length > 0) {
          // For small values, show more precision
          if (integerPart === BigInt(0)) {
            // Limit to 6 digits for small values
            const digits = Math.min(6, fractionalStr.length);
            result = `${result}.${fractionalStr.substring(0, digits)}`;
          } else {
            // Limit to 4 digits for larger values
            const digits = Math.min(4, fractionalStr.length);
            result = `${result}.${fractionalStr.substring(0, digits)}`;
          }
        }
      }
      
      // Add commas for thousands
      if (integerPart >= BigInt(1000)) {
        const intStr = integerPart.toString();
        const withCommas = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        result = result.replace(intStr, withCommas);
      }
      
      return result;
    } catch (error) {
      console.error('Error formatting token balance:', error);
      return balance;
    }
  }

  if (!address) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner className="h-8 w-8 mb-4" />
            <p className="text-muted-foreground">Loading tokens...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load tokens"}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <p className="text-muted-foreground">No tokens found</p>
        ) : (
          <div className="space-y-4">
            {tokens
              .filter(token => {
                // Additional check to filter out tokens with 0 balance or unknown names
                try {
                  // Try to convert the balance to a number for comparison
                  const bigIntBalance = BigInt(token.balance);
                  if (bigIntBalance === BigInt(0)) {
                    return false;
                  }
                  
                  // Skip tokens with unhelpful names
                  if (token.name === 'Unknown Token' && token.symbol === '???') {
                    return false;
                  }
                  
                  return true;
                } catch (error) {
                  // If there's an error parsing the balance, keep the token
                  return true;
                }
              })
              .map((token) => (
                <div
                  key={token.contractAddress}
                  className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="mr-4">
                    {token.logo ? (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Coins className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">{token.symbol}</div>
                  </div>
                  <div className="text-right">
                    <style>{pulsateCSS}</style>
                    <div className={cn(
                      "font-medium font-mono balance-pulsate bg-black/5 dark:bg-white/5 text-primary",
                    )}>
                      {formatTokenBalance(token.balance, token.decimals)}
                    </div>
                    <a 
                      href={`https://basescan.org/token/${token.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-end gap-1 text-xs text-muted-foreground hover:text-primary mt-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 