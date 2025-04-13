"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Reset navigation state when pathname or search params change
  useEffect(() => {
    // Set isNavigating to true briefly
    setIsNavigating(true)
    
    // Then set it back to false after a short delay
    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])
  
  return (
    <>
      {/* Progress bar at the top of the page */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-1 bg-primary z-50 transition-all duration-300 ease-in-out",
          isNavigating ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: isNavigating ? "100%" : "0%",
          transition: isNavigating ? "width 10s cubic-bezier(0.1, 0.05, 0.01, 0.99)" : "opacity 0.5s ease-in-out",
        }}
      />
    </>
  )
} 