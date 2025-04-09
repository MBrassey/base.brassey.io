"use client"

import { User } from "lucide-react"
import { useState, useEffect } from "react"

interface CustomAvatarProps {
  address: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CustomAvatar({ address, size = "md", className = "" }: CustomAvatarProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Size mapping
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  // Generate a deterministic avatar URL based on the address
  const generateAvatarUrl = (addr: string) => {
    if (!addr) return ""
    return `https://source.boringavatars.com/marble/120/${addr}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !address) {
    return (
      <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center ${className}`}>
        <User className="h-1/2 w-1/2 text-primary" />
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
      <img
        src={generateAvatarUrl(address) || "/placeholder.svg"}
        alt="Avatar"
        className={`${sizeClass} object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = "none"
          const parent = e.currentTarget.parentElement
          if (parent) {
            parent.classList.add("bg-primary/10", "flex", "items-center", "justify-center")
            const icon = document.createElement("div")
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-1/2 w-1/2 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
            parent.appendChild(icon)
          }
        }}
      />
    </div>
  )
}
