"use client"
import React from 'react'

export default function TestIcons() {
  const icons = [
    { name: 'MetaMask', path: '/wallet-icons/metamask.svg' },
    { name: 'Coinbase', path: '/wallet-icons/coinbase.svg' },
    { name: 'WalletConnect', path: '/wallet-icons/walletconnect.svg' },
    { name: 'Phantom', path: '/wallet-icons/phantom.svg' },
  ]

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-6">Wallet Icons Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {icons.map((icon) => (
          <div key={icon.name} className="flex flex-col items-center p-4 border rounded-lg">
            <div className="h-16 w-16 relative mb-3 flex items-center justify-center">
              <img
                src={icon.path}
                alt={icon.name}
                width={64}
                height={64}
                className="object-contain"
                onError={(e) => {
                  console.error(`Error loading image for ${icon.name}:`, e);
                }}
                onLoad={() => console.log(`Image loaded successfully for ${icon.name}`)}
              />
            </div>
            <span className="text-sm font-medium">{icon.name}</span>
            <span className="text-xs text-gray-500 mt-1">{icon.path}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 