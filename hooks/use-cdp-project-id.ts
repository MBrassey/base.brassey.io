"use client"

import { useState, useEffect } from 'react'

export function useCdpProjectId() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const response = await fetch('/api/onchain-config')
        if (!response.ok) {
          throw new Error('Failed to fetch project ID')
        }
        const data = await response.json()
        if (data.projectId) {
          setProjectId(data.projectId)
        } else {
          setError('Project ID not available')
        }
      } catch (err) {
        console.error('Error fetching project ID:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectId()
  }, [])

  return { projectId, isLoading, error }
} 