import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { WagmiConfig } from "@/providers/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "base.brassey.io - Crypto Dashboard",
  description: "Track your crypto portfolio with base.brassey.io",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
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


import './globals.css'