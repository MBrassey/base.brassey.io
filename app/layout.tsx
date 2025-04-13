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
        {/* Note: Removed dangerouslySetInnerHTML script to prevent share-modal errors */}
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