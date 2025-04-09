"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { base } from "viem/chains"
import dynamic from "next/dynamic"

// Dynamically import the Avatar component with no SSR
const DynamicAvatar = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Avatar), {
  ssr: false,
  loading: () => <AvatarFallback />,
})

interface SafeAvatarProps {
  address: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function AvatarFallback({ size = "md", address }: { size?: "sm" | "md" | "lg"; address?: string }) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  // Generate a fallback avatar URL based on the address
  const generateFallbackAvatarUrl = (addr: string) => {
    if (!addr) return ""
    return `https://source.boringavatars.com/marble/120/${addr}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}>
      {address ? (
        <img
          src={generateFallbackAvatarUrl(address) || "/placeholder.svg"}
          alt="Avatar"
          className={`${sizeClass} object-cover`}
          onError={(e) => {
            e.currentTarget.style.display = "none"
            e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
            const icon = document.createElement("div")
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-1/2 w-1/2 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
            e.currentTarget.parentElement?.appendChild(icon)
          }}
        />
      ) : (
        <User className="h-1/2 w-1/2 text-primary" />
      )}
    </div>
  )
}

export function SafeAvatar({ address, size = "md", className = "" }: SafeAvatarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || hasError) {
    return <AvatarFallback size={size} address={address} />
  }

  return (
    <ErrorBoundary fallback={<AvatarFallback size={size} address={address} />}>
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <DynamicAvatar
          address={address}
          chain={base}
          className={sizeClass}
          onError={() => setHasError(true)}
          defaultComponent={<AvatarFallback size={size} address={address} />}
        />
      </div>
    </ErrorBoundary>
  )
}

// Import at the end to avoid circular dependencies
import { ErrorBoundary } from "./error-boundary"
