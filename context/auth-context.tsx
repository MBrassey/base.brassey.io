"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount, useDisconnect, useEnsName } from "wagmi"
import { base } from "viem/chains"

type AuthContextType = {
  isAuthenticated: boolean
  address: string | null
  basename: string | null
  login: (address: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasename] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { address: connectedAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // Get the ENS name (basename) for the address
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: base.id,
  })

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update basename when ENS name changes
  useEffect(() => {
    if (ensName) {
      setBasename(ensName)
    }
  }, [ensName])

  // Skip ENS fetching if not mounted or no address
  useEffect(() => {
    if (!isMounted || !address) {
      return
    }
    // This effect deals with the ENS fetching being delayed until mounted
  }, [isMounted, address])

  // Update authentication state when wallet connection changes
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setIsAuthenticated(true)
      setAddress(connectedAddress)
      localStorage.setItem("userAddress", connectedAddress)
    }
  }, [isConnected, connectedAddress])

  // Check if user is already authenticated on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("userAddress")
    if (savedAddress) {
      setIsAuthenticated(true)
      setAddress(savedAddress)
    }
  }, [])

  const login = (address: string) => {
    setIsAuthenticated(true)
    setAddress(address)
    localStorage.setItem("userAddress", address)
  }

  const logout = () => {
    try {
      disconnect()
    } catch (error) {
      console.error("Error during disconnect:", error)
    } finally {
      // Continue with local state cleanup even if disconnect fails
      setIsAuthenticated(false)
      setAddress(null)
      setBasename(null)
      localStorage.removeItem("userAddress")
      
      // Force reload to ensure clean state if needed
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, address, basename, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
