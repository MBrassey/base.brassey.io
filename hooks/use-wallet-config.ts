"use client"

import { useState, useEffect } from 'react'

export function useWalletConfig() {
  const [config, setConfig] = useState<{
    walletConnectProjectId: string | null
  }>({
    walletConnectProjectId: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/wallet-config')
        if (!response.ok) {
          throw new Error('Failed to fetch wallet configuration')
        }
        const data = await response.json()
        setConfig({
          walletConnectProjectId: data.walletConnectProjectId || null
        })
      } catch (err) {
        console.error('Error fetching wallet configuration:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { 
    ...config, 
    isLoading, 
    error 
  }
} 