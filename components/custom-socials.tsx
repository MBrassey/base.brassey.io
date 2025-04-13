"use client"

import { useEffect, useState } from "react"
import { Twitter, Github, Globe, ExternalLink } from "lucide-react"
import { base } from "viem/chains"

// Custom social entry type
type SocialLink = {
  platform: string
  url: string
  username: string
}

// Mock data for fallback in case API fails
const FALLBACK_ENABLED = false; // Set to true to enable fallback data
const MOCK_SOCIALS: SocialLink[] = [
  {
    platform: "Twitter",
    url: "https://twitter.com/",
    username: "twitter"
  },
  {
    platform: "Github",
    url: "https://github.com/",
    username: "github"
  }
];

export function CustomSocials({
  address,
  className = "",
}: {
  address: string
  className?: string
}) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [fetchAttempts, setFetchAttempts] = useState(0)

  useEffect(() => {
    if (!address) return
    
    const formattedAddress = address.startsWith('0x') 
      ? address 
      : `0x${address}`
    
    const fetchSocials = async () => {
      // Don't keep retrying if we've already tried several times
      if (fetchAttempts >= 3) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Use our own API endpoint instead of directly calling Coinbase
        const response = await fetch(`/api/socials?address=${formattedAddress}`, {
          cache: 'no-store' // Ensure fresh data
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch social links: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data && Array.isArray(data.socials)) {
          // Transform and filter all valid social entries
          const links: SocialLink[] = data.socials
            .filter((social: any) => social.url && social.platform)
            .map((social: any) => ({
              platform: social.platform,
              url: social.url,
              username: social.username || social.url.split('/').pop() || social.platform
            }))
          
          setSocialLinks(links)
        } else if (FALLBACK_ENABLED) {
          // Use fallback data if API returns empty or invalid data
          setSocialLinks(MOCK_SOCIALS)
        } else {
          setSocialLinks([])
        }
      } catch (err) {
        console.error("Error fetching social links:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch social links"))
        
        if (FALLBACK_ENABLED) {
          // Use fallback data in case of error
          setSocialLinks(MOCK_SOCIALS)
        } else {
          setSocialLinks([])
        }
      } finally {
        setIsLoading(false)
        setFetchAttempts(prev => prev + 1)
      }
    }
    
    fetchSocials()
    
    // Only retry once after 2 seconds if the first attempt fails
    const retryTimeout = setTimeout(() => {
      if (error || socialLinks.length === 0) {
        fetchSocials()
      }
    }, 2000)
    
    return () => clearTimeout(retryTimeout)
  }, [address, error, socialLinks.length, fetchAttempts])
  
  if (isLoading && fetchAttempts < 2) {
    // Show loading placeholders, but only for the first two attempts
    return (
      <div className={`flex gap-2 items-center ${className}`}>
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    )
  }
  
  if (error || socialLinks.length === 0) {
    // No socials or error occurred - don't show anything
    return null
  }
  
  // Get the appropriate icon for each platform
  const getIconForPlatform = (platform: string) => {
    const lowerPlatform = platform.toLowerCase()
    
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
      return <Twitter className="h-4 w-4" />
    }
    
    if (lowerPlatform.includes('github')) {
      return <Github className="h-4 w-4" />
    }
    
    if (lowerPlatform.includes('website') || lowerPlatform.includes('personal')) {
      return <Globe className="h-4 w-4" />
    }
    
    // Default icon for other platforms
    return <ExternalLink className="h-4 w-4" />
  }
  
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      {socialLinks.map((link, index) => (
        <a 
          key={`${link.platform}-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-6 h-6 text-[#4A7E9B] hover:text-primary transition-colors"
          title={`${link.platform}: ${link.username}`}
        >
          {getIconForPlatform(link.platform)}
        </a>
      ))}
    </div>
  )
}
