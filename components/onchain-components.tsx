"use client"

import { type ReactNode, useEffect, useState } from "react"
import { User } from "lucide-react"
import { base } from "viem/chains"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "./error-boundary"

// Dynamically import OnchainKit components
// This approach doesn't directly reference the API key
const DynamicAvatar = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Avatar), {
  ssr: false,
  loading: () => <AvatarFallback />,
})

const DynamicName = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Name), {
  ssr: false,
  loading: () => <NameFallback address="" />,
})

// Fallback components
function AvatarFallback({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center`}>
      <User className="h-1/2 w-1/2 text-primary" />
    </div>
  )
}

function NameFallback({ address }: { address: string }) {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return <span>{formatAddress(address)}</span>
}

// Base Avatar component that uses OnchainKit's Avatar
export function BaseAvatar({
  address,
  size = "md",
  className = "",
  children,
}: {
  address: string
  size?: "sm" | "md" | "lg"
  className?: string
  children?: ReactNode
}) {
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

  if (!isMounted || hasError || !address) {
    return <AvatarFallback size={size} />
  }

  return (
    <ErrorBoundary fallback={<AvatarFallback size={size} />}>
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <DynamicAvatar
          address={address}
          chain={base}
          className={sizeClass}
          onError={() => setHasError(true)}
          defaultComponent={<AvatarFallback size={size} />}
        >
          {children}
        </DynamicAvatar>
      </div>
    </ErrorBoundary>
  )
}

// Base Name component that uses OnchainKit's Name
export function BaseName({
  address,
  className = "",
  children,
}: {
  address: string
  className?: string
  children?: ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || hasError || !address) {
    return <NameFallback address={address} />
  }

  return (
    <ErrorBoundary fallback={<NameFallback address={address} />}>
      <DynamicName address={address} chain={base} className={className} onError={() => setHasError(true)}>
        {children}
      </DynamicName>
    </ErrorBoundary>
  )
}

// Safe Avatar component that uses OnchainKit's Avatar
export function SafeAvatar({
  address,
  size = "md",
  className = "",
  children,
}: {
  address: string
  size?: "sm" | "md" | "lg"
  className?: string
  children?: ReactNode
}) {
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

  if (!isMounted || hasError || !address) {
    return <AvatarFallback size={size} />
  }

  return (
    <ErrorBoundary fallback={<AvatarFallback size={size} />}>
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <DynamicAvatar
          address={address}
          chain={base}
          className={sizeClass}
          onError={() => setHasError(true)}
          defaultComponent={<AvatarFallback size={size} />}
        >
          {children}
        </DynamicAvatar>
      </div>
    </ErrorBoundary>
  )
}

// Safe Name component that uses OnchainKit's Name
export function SafeName({
  address,
  className = "",
  children,
}: {
  address: string
  className?: string
  children?: ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || hasError || !address) {
    return <NameFallback address={address} />
  }

  return (
    <ErrorBoundary fallback={<NameFallback address={address} />}>
      <DynamicName address={address} chain={base} className={className} onError={() => setHasError(true)}>
        {children}
      </DynamicName>
    </ErrorBoundary>
  )
}
