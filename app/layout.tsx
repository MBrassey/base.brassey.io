import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { WagmiConfig } from "@/providers/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "base.brassey.io",
  description: "Base Name Service",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/base-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/base-logo.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <WagmiConfig>
            <AuthProvider>{children}</AuthProvider>
          </WagmiConfig>
        </ThemeProvider>
      </body>
    </html>
  )
}