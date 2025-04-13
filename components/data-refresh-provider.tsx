"use client"

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * DataRefreshProvider ensures data is refreshed when navigating between pages
 * It listens for pathname changes and invalidates relevant queries
 */
export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate queries when the path changes
    // This ensures fresh data is loaded on navigation
    queryClient.invalidateQueries({ queryKey: ["tokens"] });
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    
    // Log for debugging
    console.log("Refreshing data after navigation to:", pathname);
  }, [pathname, queryClient]);

  return <>{children}</>;
} 