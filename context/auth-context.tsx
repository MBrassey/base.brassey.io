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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [basename, setBasename] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { address: connectedAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  // Get the ENS name (basename) for the address
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: base.id,
  })

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
    
    // Clear any logout timeout on unmount
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
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
    // Prevent multiple logout attempts
    if (isLoggingOut) {
      return;
    }
    
    // Mark as logging out immediately
    setIsLoggingOut(true);
    
    // Clear local state first
    setIsAuthenticated(false);
    setAddress(null);
    setBasename(null);
    
    // Clear all localStorage items related to wallets and authentication
    localStorage.removeItem("userAddress");
    
    // Add flag to prevent WalletConnect from reconnecting during page transition
    sessionStorage.setItem("WALLET_DISCONNECT_IN_PROGRESS", "true");
    
    // Create a global error handler to catch WalletConnect errors during logout
    if (typeof window !== 'undefined') {
      // Intercept console errors during logout to prevent them from being displayed
      const originalConsoleError = console.error;
      console.error = function(...args) {
        // Suppress WalletConnect errors during logout
        if (
          args[0] && 
          (String(args[0]).includes('walletconnect') || 
           String(args[0]).includes('WalletConnect'))
        ) {
          return; // Don't log WalletConnect errors
        }
        return originalConsoleError.apply(console, args);
      };
      
      // Add a beforeunload handler to prevent reconnection during page navigation
      window.onbeforeunload = function() {
        // This will be executed right before the page is unloaded
        // Set a flag that will persist through the refresh
        sessionStorage.setItem("WALLET_DISCONNECT_IN_PROGRESS", "true");
        
        // Clean up storage one final time
        try {
          Object.keys(localStorage).forEach(key => {
            if (
              key.includes('wagmi') || 
              key.includes('wallet') || 
              key.includes('walletconnect') || 
              key.includes('wc@')
            ) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          // Ignore errors during cleanup
        }
      };
    }
    
    // Clear WalletConnect related storage
    try {
      // Clear all wallet connect related items from localStorage
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
      
      // Also clear sessionStorage for WalletConnect
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
    } catch (error) {
      console.error("Error clearing wallet data:", error);
    }
    
    // Try to disconnect wallet after clearing storage
    try {
      disconnect();
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
    
    // Use a special URL parameter approach to signal the logout
    window.location.href = "/?logout=true";
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, address, basename, login, logout, isLoggingOut }}>
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
