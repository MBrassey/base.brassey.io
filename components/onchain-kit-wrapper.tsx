"use client"

import { type ReactNode, useEffect, useState } from "react"
import { ErrorBoundary } from "./error-boundary"

interface OnchainKitWrapperProps {
  children: ReactNode
}

export default function OnchainKitWrapper({ children }: OnchainKitWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return null
  }

  // We're not initializing the OnchainKit provider here anymore
  // This avoids exposing sensitive environment variables
  return <ErrorBoundary fallback={<>{children}</>}>{children}</ErrorBoundary>
}
