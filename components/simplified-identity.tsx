"use client"

import { User } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"

interface SimplifiedIdentityProps {
  className?: string
}

export function SimplifiedIdentity({ className }: SimplifiedIdentityProps) {
  const { address } = useAuth()
  const [hasAvatarError, setHasAvatarError] = useState(false)

  if (!address) return null

  // Format address for display
  const formattedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`

  // Generate a deterministic avatar URL based on the address
  const generateAvatarUrl = (addr: string) => {
    if (!addr) return ""
    return `https://source.boringavatars.com/marble/120/${addr}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  }

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
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
      <div className="text-sm font-medium">{formattedAddress}</div>
    </div>
  )
}
