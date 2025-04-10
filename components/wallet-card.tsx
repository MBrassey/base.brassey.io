"use client"
import { ExternalLink, User, Wallet } from "lucide-react"
import { useBalance } from "wagmi"
import { formatEther } from "viem"
import type { Chain } from "viem/chains"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "./error-boundary"
import { BaseAvatar, BaseName } from "./onchain-components"
import { useCdpProjectId } from "@/hooks/use-cdp-project-id"

interface WalletCardProps {
  address: string
  chain: Chain
  className?: string
}

export function WalletCard({ address, chain, className = "" }: WalletCardProps) {
  // Base explorer URL
  const baseExplorerUrl = "https://basescan.org"

  // Get the Coinbase Developer Platform project ID
  const { projectId, isLoading: isLoadingProjectId } = useCdpProjectId()
  
  // Fallback project ID in case the API fails
  const fallbackProjectId = "0ed75430-5a19-4e01-b051-f4ab0d5cbe0a"

  // State to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false)

  // Get wallet balance using wagmi
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: chain?.id,
  })

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Function to generate Coinbase onramp URL
  const getCoinbaseOnrampUrl = () => {
    // Base URL for Coinbase onramp
    const baseUrl = "https://pay.coinbase.com/buy/select-asset"

    // Parameters for the URL - use the fetched project ID or fallback
    const cdpProjectId = projectId || fallbackProjectId
    
    const params = new URLSearchParams({
      appId: cdpProjectId,
      destinationWallets: JSON.stringify([
        {
          address,
          blockchains: ["base"],
          assets: ["ETH", "USDC"],
        },
      ]),
      presetFiatAmount: "50",
      presetFiatCurrency: "USD",
      successUrl: window.location.origin + "/dashboard",
      failureUrl: window.location.origin + "/dashboard",
    })

    return `${baseUrl}?${params.toString()}`
  }

  // Function to open a popup window for funding
  const openFundingPopup = () => {
    const url = getCoinbaseOnrampUrl()
    const width = 500
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    window.open(
      url,
      "Fund Wallet",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    )
  }

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Your {chain?.name || "Base"} Wallet
        </CardTitle>
        <CardDescription>View your wallet and assets</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center md:flex-row md:items-center md:gap-4 mb-6 md:mb-0">
            {/* Avatar with error boundary */}
            <ErrorBoundary
              fallback={
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              }
            >
              <BaseAvatar address={address} size="lg" />
            </ErrorBoundary>

            <div className="text-center md:text-left mt-3 md:mt-0">
              <div className="text-lg font-semibold">
                <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                  <BaseName address={address} />
                </ErrorBoundary>
              </div>
              <div
                className="text-sm text-muted-foreground mt-1 cursor-pointer"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                Click to copy address
              </div>
            </div>
          </div>

          <div className="text-center md:text-right mt-4 md:mt-0">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-xl font-bold">
              {isBalanceLoading ? (
                <Skeleton className="h-8 w-32 mx-auto md:ml-auto" />
              ) : (
                <div>
                  {balanceData
                    ? `${Number.parseFloat(formatEther(balanceData.value)).toFixed(4)} ${balanceData.symbol}`
                    : "0.0000 ETH"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Network</span>
            <span className="text-sm">{chain?.name || "Base"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Chain ID</span>
            <span className="text-sm">{chain?.id || "8453"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-4">
        <Button
          variant="outline"
          className="w-full justify-center sm:justify-start"
          onClick={() => window.open(`${baseExplorerUrl}/address/${address}`, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </Button>

        {/* Fund wallet button that opens a popup */}
        <Button
          className="w-full justify-center sm:justify-start"
          onClick={() => {
            if (isMounted) {
              openFundingPopup()
            }
          }}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Fund Wallet
        </Button>
      </CardFooter>
    </Card>
  )
}
