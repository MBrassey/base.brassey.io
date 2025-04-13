"use client"

import { useQuery } from "@tanstack/react-query"

export function useBlockHeight() {
  return useQuery({
    queryKey: ["blockHeight"],
    queryFn: async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const response = await fetch('/api/block-height', {
          signal: controller.signal,
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data && typeof data.blockNumber === 'number') {
          return data
        } else {
          throw new Error('Invalid block number response')
        }
      } finally {
        clearTimeout(timeoutId)
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  })
} 