"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { base } from "viem/chains"
import { UserIdentity } from "./user-identity"

export function IdentityDebug() {
  const { address } = useAuth()

  useEffect(() => {
    // Log information for debugging
    if (address) {
      console.log("Address:", address)
      console.log("Chain:", base)
    }
  }, [address])

  if (!address) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Identity Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Address</h3>
            <p className="text-sm break-all">{address}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Chain</h3>
            <p className="text-sm">
              {base.name} (ID: {base.id})
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Identity Card</h3>
            <div className="border rounded-lg p-2">
              <UserIdentity address={address} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
