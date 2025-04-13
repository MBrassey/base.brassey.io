import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { WalletConnectionProvider } from "@/components/wallet-connection-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { DataRefreshProvider } from "@/components/data-refresh-provider"
import { NavigationProgress } from "@/components/navigation-progress"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "base.brassey.io",
  description: "Base Name Service",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              // CORS Proxy Helper
              (function() {
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                  if (typeof url === 'string' && url.includes('api.coinbase.com/identity/v1/socials') && !url.includes('/api/')) {
                    // Redirect Coinbase API calls to our proxy
                    try {
                      const originalURL = new URL(url);
                      const address = originalURL.searchParams.get('address');
                      const chainId = originalURL.searchParams.get('chain_id');
                      if (address) {
                        return originalFetch('/api/socials/proxy?address=' + address + (chainId ? '&chain_id=' + chainId : ''), options);
                      }
                    } catch (e) {
                      // If URL parsing fails, proceed with original request
                      console.warn('Failed to parse Coinbase URL:', e);
                    }
                  }
                  // Pass through all other requests
                  return originalFetch(url, options);
                };
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#020506]`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <QueryProvider>
            <WalletConnectionProvider>
              <AuthProvider>
                <DataRefreshProvider>
                  <NavigationProgress />
                  {children}
                </DataRefreshProvider>
              </AuthProvider>
            </WalletConnectionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}