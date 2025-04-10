"use client"

import React, { useState } from 'react'
import { Wallet } from 'lucide-react'

interface WalletIconProps {
  connectorId: string
  name: string
  size?: number
}

export function WalletIcon({ connectorId, name, size = 28 }: WalletIconProps) {
  const [hasError, setHasError] = useState(false)
  
  // Map connector IDs to icon paths
  const getIconPath = (id: string): string => {
    const idLower = id.toLowerCase()
    
    if (idLower.includes('metamask') || idLower === 'injected') {
      return '/wallet-icons/metamask-simple.svg'
    }
    if (idLower.includes('coinbase')) {
      return '/wallet-icons/coinbase-simple.svg'
    }
    if (idLower.includes('walletconnect')) {
      return '/wallet-icons/walletconnect.svg'
    }
    if (idLower.includes('phantom')) {
      return '/wallet-icons/phantom-simple.svg'
    }
    
    return ''
  }

  const iconPath = getIconPath(connectorId)
  
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
      onError={() => setHasError(true)}
    />
  )
} 