"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useAccount, useDisconnect, useEnsName } from "wagmi"
import { base } from "viem/chains"
import { useRouter } from "next/navigation"

type AuthContextType = {
  isAuthenticated: boolean
  address: string | null
  basename: string | null
  login: (address: string) => void
  logout: () => void
  isLoggingOut: boolean
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasename] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { address: connectedAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  // Get the ENS name (basename) for the address
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: base.id,
  })

  // Set isMounted to true after component mounts and handle initial auth state
  useEffect(() => {
    setIsMounted(true)
    
    // Check localStorage for saved address
    const savedAddress = localStorage.getItem("userAddress")
    if (savedAddress) {
      setIsAuthenticated(true)
      setAddress(savedAddress)
    }
    
    // Mark as initialized after initial auth check
    setIsInitialized(true)
    
    // Clear any logout timeout on unmount
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current)
      }
    }
  }, [])

  // Update authentication state when wallet connection changes
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setIsAuthenticated(true)
      setAddress(connectedAddress)
      localStorage.setItem("userAddress", connectedAddress)
    } else if (!isConnected && !isLoggingOut && isInitialized) {
      // Only clear auth state if not in the process of logging out and initialization is complete
      const savedAddress = localStorage.getItem("userAddress")
      if (!savedAddress) {
        setIsAuthenticated(false)
        setAddress(null)
      }
    }
  }, [isConnected, connectedAddress, isLoggingOut, isInitialized])

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

  const login = (address: string) => {
    setIsAuthenticated(true)
    setAddress(address)
    localStorage.setItem("userAddress", address)
  }

  const logout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut) {
      console.log("Logout already in progress, ignoring additional request");
      return;
    }
    
    console.log("Starting logout process");
    
    // Mark as logging out immediately
    setIsLoggingOut(true);

    try {
      // First disconnect the wallet
      console.log("Calling disconnect from wagmi");
      await disconnect();
      
      // Then clear all storage
      if (typeof window !== 'undefined') {
        console.log("Clearing storage items");
        
        // Clear auth-related items first
        localStorage.removeItem("userAddress");
        sessionStorage.setItem("WALLET_DISCONNECT_IN_PROGRESS", "true");
        
        // Clear wallet-related items from localStorage
        Object.keys(localStorage).forEach(key => {
          if (
            key.includes('wagmi') || 
            key.includes('wallet') || 
            key.includes('walletconnect') || 
            key.includes('wc@') ||
            key.includes('connectedWallets') ||
            key.includes('coinbase') ||
            key.includes('brave') ||
            key.includes('metamask')
          ) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear wallet-related items from sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (
            key.includes('wagmi') || 
            key.includes('wallet') || 
            key.includes('walletconnect') || 
            key.includes('wc@')
          ) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Clear any pending timeouts
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
        logoutTimeoutRef.current = null;
      }
      
      // Clear local state
      setIsAuthenticated(false);
      setAddress(null);
      setBasename(null);
      
      // Use router for navigation if available, fallback to location
      if (router) {
        router.push('/');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, try to force logout
      setIsAuthenticated(false);
      setAddress(null);
      setBasename(null);
      
      // Force navigation to login
      if (router) {
        router.push('/');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      // Reset logging out state
      setIsLoggingOut(false);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      address, 
      basename, 
      login, 
      logout, 
      isLoggingOut,
      isInitialized 
    }}>
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
