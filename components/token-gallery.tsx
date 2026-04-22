"use client"

import { useAuth } from "@/context/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { ExternalLink, AlertCircle, Coins, Shield, ShieldOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTokens, type TokenData } from "@/hooks/use-tokens"
import { useEffect, useMemo, useState } from "react"

export function TokenGallery() {
  const { address } = useAuth()
  const { data, isLoading, isError, error, refetch } = useTokens()
  const tokens = data?.tokens || []
  const [showSpam, setShowSpam] = useState(false)

  const spamCount = useMemo(() => tokens.filter((t) => t.isSpam).length, [tokens])

  // Only treat the query as "loading" when we have nothing to show yet.
  // Background refetches shouldn't re-trigger the spinner.
  const showLoading = isLoading && tokens.length === 0

  // No auto-refetch interval, no refetch on tab visibility change. Token
  // balances are loaded once on mount and then only on explicit refetch()
  // (e.g. after a successful swap). This stops the dashboard from flashing
  // a "Loading…" state every few seconds.

  const formatTokenBalance = (balance: string, decimals: number) => {
    try {
      const divisor = BigInt(10 ** decimals)
      const bigIntBalance = BigInt(balance)
      const integerPart = bigIntBalance / divisor
      const fractionalPart = bigIntBalance % divisor
      let result = integerPart.toString()
      if (fractionalPart > 0) {
        let fractionalStr = fractionalPart.toString().padStart(decimals, "0").replace(/0+$/, "")
        if (fractionalStr.length > 0) {
          const digits = integerPart === BigInt(0) ? Math.min(6, fractionalStr.length) : Math.min(4, fractionalStr.length)
          result = `${result}.${fractionalStr.substring(0, digits)}`
        }
      }
      if (integerPart >= BigInt(1000)) {
        const intStr = integerPart.toString()
        result = result.replace(intStr, intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      }
      return result
    } catch {
      return balance
    }
  }

  if (!address) return null

  if (showLoading) {
    return (
      <div className="panel p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Spinner className="h-6 w-6" />
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">loading tokens…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="panel p-6">
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load tokens</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Unknown error"}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => refetch()} className="border-border bg-surface-0 font-mono text-[11px] uppercase tracking-[0.18em]">
            retry
          </Button>
        </div>
      </div>
    )
  }

  const visibleTokens = tokens.filter((token: TokenData) => {
    try {
      if (BigInt(token.balance) === BigInt(0)) return false
      if (token.name === "Unknown Token" && token.symbol === "???") return false
      if (!showSpam && token.isSpam) return false
      return true
    } catch {
      return true
    }
  })

  const SpamToggle = spamCount > 0 ? (
    <button
      onClick={() => setShowSpam((v) => !v)}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-mint/50 hover:text-mint"
      title={showSpam ? "Hide flagged spam" : "Show flagged spam"}
    >
      {showSpam ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3 text-mint" />}
      {showSpam ? `hide spam · ${spamCount}` : `${spamCount} hidden`}
    </button>
  ) : null

  if (visibleTokens.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <Coins className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {spamCount > 0 && !showSpam ? "all tokens filtered as spam" : "no tokens on this wallet"}
        </p>
        {SpamToggle && <div className="mt-4 flex justify-center">{SpamToggle}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {SpamToggle && <div className="flex justify-end">{SpamToggle}</div>}
      <div className="panel divide-y divide-border overflow-hidden">
        {visibleTokens.map((token: TokenData) => (
        <div
          key={token.contractAddress}
          className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/50 ${token.isSpam ? "opacity-60" : ""}`}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-surface-0">
            {token.logo ? (
              <img
                src={token.logo}
                alt={token.symbol}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Coins className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate font-display text-sm font-semibold text-foreground">{token.name}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {token.symbol}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-sm tabular-nums text-mint">
              {formatTokenBalance(token.balance, token.decimals)}
            </div>
            <a
              href={`https://basescan.org/token/${token.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-mint"
            >
              basescan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        ))}
      </div>
    </div>
  )
}
