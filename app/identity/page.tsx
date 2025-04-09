"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { WalletIdentity } from "@/components/wallet-identity"

export default function IdentityPage() {
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !address) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Identity</CardTitle>
          <CardDescription>View your onchain identity details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card p-4">
            <WalletIdentity address={address} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
