"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { IdentityDebug } from "@/components/identity-debug"

export default function DebugPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <IdentityDebug />
      </div>
    </div>
  )
}
