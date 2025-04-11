"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useAccount } from "wagmi"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { ArrowLeftCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isConnected, address } = useAccount()
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      
      <Card className="w-full max-w-md bg-[#020506] border-[#1A1D21]">
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
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-full">
            <div className="flex flex-col items-center gap-2">
              <WalletConnectionModal />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-400">
          <p>Connect with your Ethereum wallet</p>
          <p>Your wallet is used to securely access your dashboard</p>
        </CardFooter>
      </Card>
    </div>
  )
}
