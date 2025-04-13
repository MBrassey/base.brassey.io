"use client"

import { type ReactNode, useEffect, useState } from "react"
import { User, Twitter, Globe, Github } from "lucide-react"
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

const DynamicSocials = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Socials), {
  ssr: false,
  loading: () => <SocialsFallback />,
})

const DynamicAddress = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Address), {
  ssr: false,
  loading: () => <AddressFallback address="" />,
})

const DynamicIdentity = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Identity), {
  ssr: false,
  loading: () => <IdentityCardFallback address="" />,
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

function AddressFallback({ address }: { address: string }) {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return <span className="text-sm text-muted-foreground">{formatAddress(address)}</span>
}

// Fallback components for socials
function SocialsFallback() {
  // Return null to avoid showing mock icons
  return null;
}

// Fallback component for identity card
function IdentityCardFallback({ address }: { address: string }) {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className="flex items-center gap-4">
      <AvatarFallback size="lg" />
      <div>
        <div className="text-lg font-semibold">{formatAddress(address)}</div>
        <p className="text-sm text-muted-foreground">Base Network</p>
        <SocialsFallback />
      </div>
    </div>
  )
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
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  if (!isMounted || hasError || !address || !addressFormatted) {
    return <AvatarFallback size={size} />
  }

  return (
    <ErrorBoundary fallback={<AvatarFallback size={size} />}>
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <DynamicAvatar
          address={addressFormatted}
          chain={base}
          className={sizeClass}
          onError={() => setHasError(true)}
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
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  if (!isMounted || hasError || !address || !addressFormatted) {
    return <NameFallback address={address} />
  }

  return (
    <ErrorBoundary fallback={<NameFallback address={address} />}>
      <DynamicName 
        address={addressFormatted}
        chain={base} 
        className={className}
        onError={() => setHasError(true)}
      >
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
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  if (!isMounted || hasError || !address || !addressFormatted) {
    return <AvatarFallback size={size} />
  }

  return (
    <ErrorBoundary fallback={<AvatarFallback size={size} />}>
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <DynamicAvatar
          address={addressFormatted}
          chain={base}
          className={sizeClass}
          onError={() => setHasError(true)}
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
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  if (!isMounted || hasError || !address || !addressFormatted) {
    return <NameFallback address={address} />
  }

  return (
    <ErrorBoundary fallback={<NameFallback address={address} />}>
      <DynamicName 
        address={addressFormatted} 
        chain={base} 
        className={className} 
        onError={() => setHasError(true)}
      >
        {children}
      </DynamicName>
    </ErrorBoundary>
  )
}

// Base Socials component that uses OnchainKit's Socials
export function BaseSocials({
  address,
  className = "",
}: {
  address: string
  className?: string
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  // We'll return null until we have a properly formatted address
  if (!isMounted || hasError || !address || !addressFormatted) {
    return null
  }

  return (
    <ErrorBoundary fallback={<SocialsFallback />}>
      <div 
        className={`socials-wrapper ${className}`} 
      >
        <DynamicSocials 
          address={addressFormatted} 
          chain={base}
          className="text-[#4A7E9B]"
        />
      </div>
    </ErrorBoundary>
  )
}

// New component that uses the Identity container from OnchainKit
export function BaseIdentity({
  address,
  className = "",
}: {
  address: string
  className?: string
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [addressFormatted, setAddressFormatted] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        setAddressFormatted(formattedAddr)
      } catch (e) {
        setHasError(true)
      }
    }
  }, [address])

  if (!isMounted || hasError || !address || !addressFormatted) {
    return <IdentityCardFallback address={address} />
  }
  
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }
  
  return (
    <ErrorBoundary fallback={<IdentityCardFallback address={address} />}>
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full overflow-hidden">
            <BaseAvatar address={addressFormatted} size="lg" />
          </div>

          <div className="flex-1">
            {/* Name */}
            <h2 className="text-lg font-semibold">
              <BaseName address={addressFormatted} />
            </h2>
            
            {/* Address */}
            <p className="text-sm text-muted-foreground">{formatAddress(address)}</p>
            
            {/* Socials - only use real data from OnchainKit */}
            <div className="mt-2">
              <BaseSocials address={addressFormatted} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Keep original BaseIdentityCard for backward compatibility
export function BaseIdentityCard({
  address,
  className = "",
}: {
  address: string
  className?: string
}) {
  // Use the new BaseIdentity component instead
  return <BaseIdentity address={address} className={className} />
}
