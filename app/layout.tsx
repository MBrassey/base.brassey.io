import type { Metadata } from "next"
import "@/app/globals.css"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { WalletConnectionProvider } from "@/components/wallet-connection-provider"
import { DataRefreshProvider } from "@/components/data-refresh-provider"
import { NavigationProgress } from "@/components/navigation-progress"

// Mirror brassey.io — a single JetBrains Mono face used everywhere. The
// --font-sans / --font-mono / --font-display variables all resolve to the
// same font so every component ends up in the mono voice.
const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "base.brassey.io — Onchain Dashboard",
  description: "Wallet, identity, tokens, and NFTs on Base.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${jbMono.variable}`}
      style={{
        // Aliases so font-sans and font-display also pick up JetBrains Mono.
        // @ts-expect-error — setting CSS custom properties
        "--font-sans": "var(--font-mono)",
        "--font-display": "var(--font-mono)",
      }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalFetch = window.fetch;
                window.fetch = function(url, options) {
                  if (typeof url === 'string' && url.includes('api.coinbase.com/identity/v1/socials') && !url.includes('/api/')) {
                    try {
                      var originalURL = new URL(url);
                      var address = originalURL.searchParams.get('address');
                      var chainId = originalURL.searchParams.get('chain_id');
                      if (address) {
                        return originalFetch('/api/socials/proxy?address=' + address + (chainId ? '&chain_id=' + chainId : ''), options);
                      }
                    } catch (e) { /* fall through */ }
                  }
                  return originalFetch(url, options);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="font-mono bg-background text-foreground ambient-bg min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <WalletConnectionProvider>
            <AuthProvider>
              <DataRefreshProvider>
                <NavigationProgress />
                {children}
              </DataRefreshProvider>
            </AuthProvider>
          </WalletConnectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
