"use client"

import React, { useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'

interface WalletIconProps {
  connectorId: string
  name: string
  size?: number
}

export function WalletIcon({ connectorId, name, size = 28 }: WalletIconProps) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    console.log(`WalletIcon rendered for: ${connectorId}, name: ${name}`)
  }, [connectorId, name])
  
  // Map connector IDs to icon paths
  const getIconPath = (id: string, walletName: string): string => {
    const idLower = id.toLowerCase()
    const nameLower = walletName.toLowerCase()
    
    console.log(`Getting icon path for: ${idLower}, name: ${nameLower}`)
    
    // Check for Brave wallet specifically - it typically uses the injected connector
    // but will have "brave" in the name
    if (nameLower.includes('brave')) {
      return '/wallet-icons/brave-wallet.svg'
    }
    
    if (idLower.includes('metamask') || (idLower === 'injected' && nameLower.includes('metamask'))) {
      return '/wallet-icons/metamask-simple.svg'
    }
    if (idLower.includes('coinbase')) {
      return '/wallet-icons/coinbase-simple.svg'
    }
    if (idLower.includes('walletconnect')) {
      return '/wallet-icons/walletconnect.svg'
    }
    if (idLower.includes('safe') || nameLower.includes('safe') || nameLower.includes('gnosis')) {
      return '/wallet-icons/safe-wallet.svg'
    }
    if (idLower.includes('phantom') || nameLower.includes('phantom')) {
      return '/wallet-icons/phantom-simple.svg'
    }
    // Generic browser extension (will catch any other injected providers)
    if (idLower === 'injected') {
      return '/wallet-icons/browser-wallet.svg'
    }
    
    return ''
  }

  const iconPath = getIconPath(connectorId, name)
  
  if (hasError || !iconPath) {
    return <Wallet className="h-5 w-5" />
  }

  return (
    <img 
      src={iconPath}
      alt={`${name} icon`}
      width={size}
      height={size}
      className="w-7 h-7 object-contain"
      onError={(e) => {
        console.error(`Error loading image from path: ${iconPath}`)
        setHasError(true)
      }}
    />
  )
} 