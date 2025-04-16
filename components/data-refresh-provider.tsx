"use client"

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useAuth } from "@/context/auth-context";

/**
 * DataRefreshProvider ensures data is refreshed when navigating between pages
 * It listens for pathname changes and invalidates relevant queries
 */
export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { address: wagmiAddress } = useAccount();
  const { address: authAddress, isInitialized } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use either address, preferring the auth context address
  const address = authAddress || wagmiAddress;

  // Set mounted state and handle page refresh
  useEffect(() => {
    setIsMounted(true);
    
    // Check if this is a page refresh
    if (typeof window !== 'undefined' && window.performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry && navEntry.type === 'reload') {
        setIsRefreshing(true);
        // Reset all queries on page refresh
        queryClient.resetQueries();
      }
    }
  }, [queryClient]);

  // Function to handle data refresh
  const refreshData = () => {
    if (!address || !isInitialized || !isMounted) return;

    // Clear existing data first to force a fresh load
    queryClient.removeQueries({ queryKey: ["tokens"] });
    queryClient.removeQueries({ queryKey: ["nfts"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.removeQueries({ queryKey: ["blockHeight"] });

    // Immediate invalidation
    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["blockHeight"] });
    };

    // Execute immediate invalidation
    invalidateQueries();

    // Staggered invalidations with increasing delays
    return [800, 2000, 5000].map(delay => 
      setTimeout(invalidateQueries, delay)
    );
  };

  // Refresh data on mount, address change, initialization, or page refresh
  useEffect(() => {
    if (!isMounted) return;
    
    if (address && isInitialized) {
      // Force immediate refresh if this is a page reload
      if (isRefreshing) {
        queryClient.resetQueries();
        setIsRefreshing(false);
      }
      
      const timeouts = refreshData();
      
      // Set up periodic refresh
      const refreshInterval = setInterval(refreshData, 30000); // Refresh every 30 seconds

      return () => {
        timeouts?.forEach(clearTimeout);
        clearInterval(refreshInterval);
      };
    }
  }, [address, isInitialized, isMounted, isRefreshing]);

  // Refresh data on navigation
  useEffect(() => {
    if (pathname === '/dashboard') {
      const timeouts = refreshData();
      return () => timeouts?.forEach(clearTimeout);
    }
  }, [pathname]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeouts = refreshData();
        // Clean up timeouts if the visibility changes again quickly
        return () => timeouts?.forEach(clearTimeout);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
} 