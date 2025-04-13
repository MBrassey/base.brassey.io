"use client"

import { type ReactNode, useEffect, useState } from "react"
import { User } from "lucide-react"
import { base } from "viem/chains"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "./error-boundary"

// Dynamically import OnchainKit components
const DynamicAvatar = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Avatar), {
  ssr: false,
  loading: () => <AvatarFallback />,
})

const DynamicName = dynamic(() => import("@coinbase/onchainkit/identity").then((mod) => mod.Name), {
  ssr: false,
  loading: () => <NameFallback address="" />,
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
  return (
    <div className="flex gap-2 items-center h-6">
      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    </div>
  );
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
  const [isLoading, setIsLoading] = useState(true)

  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  // Create a manual fallback avatar with the same address
  const generateAvatarBg = (addr: string) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate hue (0-360)
    const h = Math.abs(hash % 360);
    // Saturation and lightness
    const s = 70;
    const l = 55;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  useEffect(() => {
    setIsMounted(true)
    setIsLoading(true)
    let isMounted = true;
    
    if (address) {
      try {
        // Format address to ensure it starts with 0x
        const formattedAddr = address.startsWith('0x') 
          ? address as `0x${string}` 
          : `0x${address}` as `0x${string}`
        
        if (isMounted) {
          setAddressFormatted(formattedAddr)
          // Wait briefly for the dynamic component to load
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false)
            }
          }, 500)
        }
      } catch (e) {
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [address])

  // Use the fallback when loading, has error, or address isn't formatted
  if (isLoading || !isMounted || hasError || !address || !addressFormatted) {
    // Custom fallback with user address initials
    return (
      <div 
        className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center`}
        style={{ backgroundColor: address ? generateAvatarBg(address) : '#4A7E9B' }}
      >
        <div className="text-white font-bold" style={{ fontSize: size === 'sm' ? '14px' : size === 'lg' ? '22px' : '18px' }}>
          {address ? address.substring(2, 4).toUpperCase() : '??'}
        </div>
      </div>
    )
  }

  // Use the OnchainKit avatar when everything is ready
  return (
    <ErrorBoundary 
      fallback={
        <div 
          className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center`}
          style={{ backgroundColor: generateAvatarBg(address) }}
        >
          <div className="text-white font-bold" style={{ fontSize: size === 'sm' ? '14px' : size === 'lg' ? '22px' : '18px' }}>
            {address.substring(2, 4).toUpperCase()}
          </div>
        </div>
      }
    >
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
  
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }
  
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
  
  return (
    <ErrorBoundary fallback={<IdentityCardFallback address={address} />}>
      <div className={`identity-card ${className}`}>
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
            
            {/* Socials - use OnchainKit's Socials component directly */}
            <div className="mt-2 social-links-container">
              {/* Import and use Socials from OnchainKit directly in your components */}
              {/* Example: <Socials address={addressFormatted} chain={base} /> */}
              {/* We don't import it here to keep component dependencies clean */}
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
