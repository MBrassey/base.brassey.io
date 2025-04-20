"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useAccount } from "wagmi"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { ArrowLeftCircle, Wallet, Coins, Layers, ImageIcon, User, Link as LinkIcon } from "lucide-react"
import Image from "next/image"

// Integration Features component to display key app capabilities
function IntegrationFeatures() {
  return (
    <Card className="w-full max-w-xs bg-[#020506] border-[#1A1D21] flex flex-col h-[386px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[#4A7E9B]">Integration Features</CardTitle>
        <CardDescription className="text-gray-400">Key capabilities of this dashboard</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 text-xs sm:text-sm">
          <li className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#4A7E9B]" />
            <span>Multiple wallet connections</span>
          </li>
          <li className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#4A7E9B]" />
            <span>Base NFT gallery</span>
          </li>
          <li className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#4A7E9B]" />
            <span>ETH & ERC-20 token balances</span>
          </li>
          <li className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#4A7E9B]" />
            <span>OnchainKit identity</span>
          </li>
          <li className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-[#4A7E9B]" />
            <span>OnchainKit socials</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowLeftCircle className="h-4 w-4 text-[#4A7E9B]" />
            <span>Coinbase onramp integration</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#4A7E9B]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Wagmi React hooks</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#4A7E9B]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" />
              <path d="M3.27002 6.96002L12 12.01L20.73 6.96002" stroke="currentColor" strokeWidth="2" />
              <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Alchemy API integration</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="text-xs text-gray-400 border-t border-[#1A1D21] pt-4 mt-auto">
        Base blockchain integration
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isConnected, address } = useAccount()
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for reload or fresh parameters and ensure logout is complete
  useEffect(() => {
    if (!isMounted) return

    // Check URL for reload or fresh parameters
    const queryParams = new URLSearchParams(window.location.search)
    const reload = queryParams.get('reload')
    const fresh = queryParams.get('fresh')
    
    if (reload === 'true' || fresh === 'true') {
      console.log('Detected reload/fresh parameter, clearing wallet connections')
      
      // Force clear any wallet storage
      Object.keys(localStorage).forEach(key => {
        if (
          key.includes('wagmi') || 
          key.includes('wallet') || 
          key.includes('walletconnect') || 
          key.includes('wc@') ||
          key.includes('connectedWallets') ||
          key.includes('coinbase') ||
          key.includes('brave') ||
          key.includes('metamask') ||
          key === 'userAddress'
        ) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear all relevant session storage
      Object.keys(sessionStorage).forEach(key => {
        if (
          key.includes('wagmi') || 
          key.includes('wallet') || 
          key.includes('walletconnect') || 
          key.includes('wc@') ||
          key === 'WALLET_DISCONNECT_IN_PROGRESS'
        ) {
          sessionStorage.removeItem(key)
        }
      })
      
      // Clean URL by removing parameters
      const url = new URL(window.location.href)
      if (url.searchParams.has('reload')) url.searchParams.delete('reload')
      if (url.searchParams.has('fresh')) url.searchParams.delete('fresh')
      if (url.searchParams.has('logout')) url.searchParams.delete('logout')
      window.history.replaceState({}, '', url.toString())
    }
  }, [isMounted])

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address && isMounted) {
      router.push("/dashboard")
    }
  }, [isConnected, address, router, isMounted])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && isMounted) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isMounted])

  // Don't render anything during SSR or if already authenticated
  if (!isMounted || isAuthenticated || isConnected) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-[#020506] flex items-center justify-center px-4">
      {/* Back to brassey.io navigation tab */}
      <a
        href="https://brassey.io"
        className="fixed top-8 left-0 bg-[#020506] text-accent border border-[#1A1D21] border-l-0 px-4 py-2 rounded-r-md flex items-center gap-2 hover:text-accent/80 transition-all shadow-sm z-10 group"
      >
        <ArrowLeftCircle className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to brassey.io</span>
      </a>
      
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-3xl">
        {/* Features card (hidden on very small screens) */}
        <div className="hidden sm:block w-full md:w-auto">
          <IntegrationFeatures />
        </div>
        
        {/* Login card */}
        <Card className="w-full max-w-md bg-[#020506] border-[#1A1D21] h-auto md:h-[386px] flex flex-col">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <img 
                src="/base-logo.svg" 
                alt="Base Logo"
                className="h-6 w-6"
              />
            </div>
            <CardTitle className="text-2xl font-mono">
              <span className="text-[#4A7E9B]">base</span>
              <span className="text-white">.brassey.io</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Connect your wallet to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 flex-grow">
            <div className="w-full">
              <div className="flex flex-col items-center gap-2">
                <WalletConnectionModal />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-400 mt-auto">
            <p>Connect with your Ethereum wallet</p>
            <p>Your wallet is used to securely access your dashboard</p>
          </CardFooter>
        </Card>
        
        {/* Features for small screens only - enhanced version */}
        <div className="block sm:hidden w-full mt-4">
          <Card className="w-full bg-[#020506] border-[#1A1D21]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-[#4A7E9B]">Integration Features</CardTitle>
            </CardHeader>
            <CardContent className="py-2 pb-4">
              <ul className="grid grid-cols-2 gap-2 text-xs">
                <li className="flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-[#4A7E9B]" />
                  <span>Multiple Wallets</span>
                </li>
                <li className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 text-[#4A7E9B]" />
                  <span>NFT Gallery</span>
                </li>
                <li className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-[#4A7E9B]" />
                  <span>ETH & Token Balances</span>
                </li>
                <li className="flex items-center gap-1">
                  <User className="h-3 w-3 text-[#4A7E9B]" />
                  <span>OnchainKit Identity</span>
                </li>
                <li className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3 text-[#4A7E9B]" />
                  <span>OnchainKit Socials</span>
                </li>
                <li className="flex items-center gap-1">
                  <ArrowLeftCircle className="h-3 w-3 text-[#4A7E9B]" />
                  <span>Coinbase Onramp</span>
                </li>
                <li className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-[#4A7E9B]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>Wagmi Hooks</span>
                </li>
                <li className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-[#4A7E9B]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M3.27002 6.96002L12 12.01L20.73 6.96002" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>Alchemy API</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}