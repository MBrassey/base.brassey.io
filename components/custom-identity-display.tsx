"use client"

import { User } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"

interface CustomIdentityDisplayProps {
  className?: string
  showAvatar?: boolean
  showName?: boolean
}

export function CustomIdentityDisplay({ className, showAvatar = true, showName = true }: CustomIdentityDisplayProps) {
  const { address } = useAuth()
  const [hasAvatarError, setHasAvatarError] = useState(false)

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Generate a deterministic avatar URL based on the address
  const generateAvatarUrl = (addr: string) => {
    if (!addr) return ""
    return `https://source.boringavatars.com/marble/120/${addr}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  }

  if (!address) return null

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {showAvatar && (
        <div className="h-8 w-8 rounded-full overflow-hidden">
          {!hasAvatarError ? (
            <img
              src={generateAvatarUrl(address) || "/placeholder.svg"}
              alt="Avatar"
              className="h-8 w-8 object-cover"
              onError={() => setHasAvatarError(true)}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      )}
      {showName && <div className="text-sm font-medium">{formatAddress(address)}</div>}
    </div>
  )
}
