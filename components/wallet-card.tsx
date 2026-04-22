"use client"

import { ArrowDownToLine, ArrowUpRight, Check, Copy, SendHorizontal } from "lucide-react"
import { useBalance } from "wagmi"
import { formatEther } from "viem"
import type { Chain } from "viem/chains"
import { useState } from "react"
import { ErrorBoundary } from "./error-boundary"
import { BaseAvatar, BaseName } from "./onchain-components"
import { SendModal } from "./send-modal"
import { ReceiveModal } from "./receive-modal"

interface WalletCardProps {
  address: string
  chain: Chain
  className?: string
}

export function WalletCard({ address, chain, className = "" }: WalletCardProps) {
  const baseExplorerUrl = "https://basescan.org"
  const [copied, setCopied] = useState(false)

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: chain?.id,
  })

  const formatAddress = (addr: string) =>
    addr ? `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* noop */
    }
  }

  const balanceWhole = balanceData ? Number.parseFloat(formatEther(balanceData.value)) : 0
  const [intPart, decPart] = balanceWhole
    .toFixed(4)
    .toString()
    .split(".")
  const balanceSymbol = balanceData?.symbol ?? "ETH"

  return (
    <div
      className={`relative overflow-hidden rounded-md border transition-colors hover:border-[#4B7F9B]/30 ${className}`}
      style={{ background: "#1F1D20", borderColor: "#1F1D20" }}
    >
      {/* subtle steel-blue bloom in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
        style={{ background: "rgba(75,127,155,0.18)" }}
      />

      <div className="relative p-5 md:p-7">
        {/* Identity row */}
        <div className="flex items-center gap-3">
          <ErrorBoundary
            fallback={
              <div className="h-10 w-10 rounded-full" style={{ background: "#4B7F9B" }} />
            }
          >
            <BaseAvatar address={address} size="sm" />
          </ErrorBoundary>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">
              <ErrorBoundary fallback={<span>{formatAddress(address)}</span>}>
                <BaseName address={address} />
              </ErrorBoundary>
            </div>
            <button
              onClick={handleCopy}
              className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-500 transition-colors hover:text-[#4B7F9B]"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "copied" : formatAddress(address)}
            </button>
          </div>
          <div className="ml-auto">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400"
              style={{ background: "#1a1a1e", borderColor: "#2a282c" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#4B7F9B", boxShadow: "0 0 8px #4B7F9B" }}
              />
              base · mainnet
            </span>
          </div>
        </div>

        {/* Balance hero */}
        <div className="mt-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            total balance
          </div>
          {isBalanceLoading ? (
            <div className="mx-auto mt-3 h-12 w-48 animate-pulse rounded bg-white/5" />
          ) : (
            <div className="mt-2 flex items-baseline justify-center gap-1 tabular-nums">
              <span className="text-5xl font-bold tracking-tight text-slate-100 md:text-6xl">
                {intPart}
              </span>
              <span className="text-3xl font-semibold tracking-tight text-slate-500 md:text-4xl">
                .{decPart}
              </span>
              <span className="ml-2 font-mono text-xs uppercase tracking-[0.2em] text-[#4B7F9B]">
                {balanceSymbol}
              </span>
            </div>
          )}
        </div>

        {/* Primary actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <SendModal
            trigger={
              <button
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-md border font-mono text-[11px] uppercase tracking-[0.2em] text-[#4B7F9B] transition-all hover:border-[#4B7F9B]/60 hover:bg-[#4B7F9B]/10"
                style={{ background: "#1a1a1e", borderColor: "rgba(75,127,155,0.35)" }}
              >
                <SendHorizontal className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                send
              </button>
            }
          />
          <ReceiveModal
            address={address}
            trigger={
              <button
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-md border font-mono text-[11px] uppercase tracking-[0.2em] text-slate-200 transition-all hover:border-[#4B7F9B]/60 hover:text-[#4B7F9B]"
                style={{ background: "#1a1a1e", borderColor: "#2a282c" }}
              >
                <ArrowDownToLine className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
                receive
              </button>
            }
          />
        </div>

        {/* Secondary link */}
        <a
          href={`${baseExplorerUrl}/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-[#4B7F9B]"
        >
          view wallet on basescan
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
