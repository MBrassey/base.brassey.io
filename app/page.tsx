"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useAccount } from "wagmi"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { ArrowLeft, ArrowUpRight, Terminal, X } from "lucide-react"

function Wordmark({ size = "xl" }: { size?: "md" | "xl" }) {
  const cls = size === "xl" ? "text-4xl md:text-6xl font-bold tracking-tight" : "text-lg font-bold"
  return (
    <span className={cls}>
      <span className="wordmark-base">base</span>
      <span className="wordmark-dot">.</span>
      <span className="wordmark-brassey">brassey</span>
      <span className="wordmark-dot">.</span>
      <span className="wordmark-io">io</span>
    </span>
  )
}

// Linux terminal window matching brassey.io
function TerminalWindow() {
  const rows: Array<{ cmd: string; out: Array<{ label: string; detail: string }> }> = [
    {
      cmd: "base --features",
      out: [
        { label: "wallet.connect", detail: "metamask · coinbase · walletconnect · injected" },
        { label: "identity",       detail: "Basenames · ENS · avatar text records" },
        { label: "balance",        detail: "ETH & ERC-20 · spam-filtered" },
        { label: "send",           detail: "native ETH + ERC-20 transfers · wagmi-signed" },
        { label: "receive",        detail: "address + QR code · deposit any base asset" },
        { label: "nfts.gallery",   detail: "on-chain art · spam-filtered" },
        { label: "socials",        detail: "twitter · github · farcaster · lens" },
        { label: "explorer",       detail: "one-click jump to basescan" },
      ],
    },
  ]

  return (
    <div className="term-window">
      {/* header bar */}
      <div className="term-header">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-slate-700/50 flex items-center justify-center">
            <Terminal className="h-2.5 w-2.5 text-slate-400" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono truncate">
            matt@base:~/brassey.io
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-slate-700/50 cursor-default">
            <div className="w-2.5 h-[1.5px] bg-slate-500" />
          </div>
          <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-slate-700/50 cursor-default">
            <div className="w-2.5 h-2.5 border border-slate-500 rounded-[1px]" />
          </div>
          <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-red-500/30 cursor-default group">
            <X className="h-3 w-3 text-slate-500 group-hover:text-red-400" />
          </div>
        </div>
      </div>

      {/* body */}
      <div className="term-body font-mono">
        {rows.map((row, i) => (
          <div key={i} className="space-y-1.5">
            <div>
              <span className="text-emerald-400">$</span>{" "}
              <span className="text-[#4B7F9B]">{row.cmd.split(" ")[0]}</span>{" "}
              <span className="text-slate-300">{row.cmd.split(" ").slice(1).join(" ")}</span>
            </div>
            <div className="text-slate-500 pl-4 space-y-1">
              {row.out.map((entry) => (
                <div key={entry.label} className="grid grid-cols-[11rem_1fr] gap-x-3">
                  <span className="text-[#4B7F9B]">{entry.label}</span>
                  <span className="truncate text-slate-400">{entry.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-1">
          <span className="text-emerald-400">✓</span>{" "}
          <span className="text-emerald-400">ready</span>{" "}
          <span className="text-slate-500">· chain_id 8453 · base mainnet</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuth()
  const { isConnected, address } = useAccount()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (!isMounted) return
    const params = new URLSearchParams(window.location.search)
    const reload = params.get("reload")
    const fresh = params.get("fresh")
    if (reload !== "true" && fresh !== "true") return
    Object.keys(localStorage).forEach((k) => {
      if (
        k.includes("wagmi") || k.includes("wallet") || k.includes("walletconnect") ||
        k.includes("wc@") || k.includes("connectedWallets") || k.includes("coinbase") ||
        k.includes("brave") || k.includes("metamask") || k === "userAddress"
      ) localStorage.removeItem(k)
    })
    Object.keys(sessionStorage).forEach((k) => {
      if (
        k.includes("wagmi") || k.includes("wallet") || k.includes("walletconnect") ||
        k.includes("wc@") || k === "WALLET_DISCONNECT_IN_PROGRESS"
      ) sessionStorage.removeItem(k)
    })
    const url = new URL(window.location.href)
    url.searchParams.delete("reload")
    url.searchParams.delete("fresh")
    url.searchParams.delete("logout")
    window.history.replaceState({}, "", url.toString())
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return
    if ((isConnected && address) || (isAuthenticated && isInitialized)) {
      router.push("/dashboard")
    }
  }, [isMounted, isConnected, address, isAuthenticated, isInitialized, router])

  if (!isMounted || isAuthenticated || isConnected) return null

  return (
    <main className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <a
          href="https://brassey.io"
          className="group inline-flex items-center gap-2 rounded-full border border-[#1F1D20] bg-[#1a1a1e]/80 px-3 py-1.5 font-mono text-xs text-slate-400 backdrop-blur transition-colors hover:border-[#4B7F9B]/50 hover:text-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          brassey.io
        </a>
        <span className="status-badge">base · mainnet</span>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-4 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <section className="space-y-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#4B7F9B]">
              <Terminal className="h-3 w-3" />
              onchain dashboard
            </div>
            <h1 className="leading-[1.05]">
              <Wordmark size="xl" />
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
              A Base-native wallet dashboard — identity, balances, NFTs, send, and receive.
              Signing powered by <span className="text-[#4B7F9B]">wagmi</span>, identity by
              {" "}<span className="text-[#4B7F9B]">Basenames</span>.
            </p>
          </div>
          <TerminalWindow />
        </section>

        <section>
          {/* Match the terminal's body color (#1F1D20) so the two columns
              read as a matched pair of windows. */}
          <div
            className="rounded-md border p-6 md:p-8 transition-colors hover:border-[#4B7F9B]/30"
            style={{ background: "#1F1D20", borderColor: "#1F1D20" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-md border"
                style={{ background: "#1a1a1e", borderColor: "#1F1D20" }}
              >
                <img src="/base-logo.svg" alt="Base" className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#4B7F9B] shadow-[0_0_10px_#4B7F9B]" />
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">connect</div>
                <div className="text-lg font-semibold text-slate-100">Sign in with your wallet</div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              Nothing stored server-side. Your wallet is used only to read onchain data.
            </p>
            <WalletConnectionModal />
            <div className="mt-6 grid grid-cols-3 gap-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <div
                className="rounded-md border px-2 py-2"
                style={{ background: "#1a1a1e", borderColor: "#1F1D20" }}
              >metamask</div>
              <div
                className="rounded-md border px-2 py-2"
                style={{ background: "#1a1a1e", borderColor: "#1F1D20" }}
              >coinbase</div>
              <div
                className="rounded-md border px-2 py-2"
                style={{ background: "#1a1a1e", borderColor: "#1F1D20" }}
              >walletconnect</div>
            </div>
            <a
              href="https://base.org"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-[#4B7F9B]"
            >
              learn about base
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-[#1F1D20]/60 px-6 py-5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>© brassey.io · 2026</span>
          <span className="inline-flex items-center gap-2">
            <Terminal className="h-3 w-3 text-[#4B7F9B]" />
            base · l2 · ethereum
          </span>
        </div>
      </footer>
    </main>
  )
}
