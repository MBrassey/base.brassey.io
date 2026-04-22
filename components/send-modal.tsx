"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Loader2, SendHorizontal } from "lucide-react"
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { base } from "wagmi/chains"
import { erc20Abi, formatUnits, isAddress, parseEther, parseUnits } from "viem"
import type { SendableToken } from "@/lib/send-tokens"
import { useTokens } from "@/hooks/use-tokens"

type Props = { trigger: React.ReactNode }

export function SendModal({ trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")

  const { address: from, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  // Native ETH balance
  const { data: ethBalance } = useBalance({
    address: from,
    chainId: base.id,
    query: { enabled: !!from },
  })

  // ERC-20 balances — already deduped + spam-tagged by the tokens hook
  const { data: tokensData } = useTokens()

  // Dynamic sendable list: ETH (if non-zero), plus every non-spam ERC-20
  // the wallet actually holds. Falls back to ETH-only when nothing else
  // is present so the modal still opens usefully.
  const available: SendableToken[] = useMemo(() => {
    const list: SendableToken[] = []

    if (ethBalance && ethBalance.value > 0n) {
      list.push({ symbol: "ETH", name: "Ether", address: "", decimals: 18 })
    }

    for (const t of tokensData?.tokens ?? []) {
      if (t.isSpam) continue
      try {
        if (BigInt(t.balance) === 0n) continue
      } catch {
        continue
      }
      list.push({
        symbol: t.symbol,
        name: t.name,
        address: t.contractAddress as `0x${string}`,
        decimals: t.decimals,
      })
    }

    // If we still have nothing (data not loaded yet, or empty wallet),
    // default to ETH so the form is never empty.
    if (list.length === 0) {
      list.push({ symbol: "ETH", name: "Ether", address: "", decimals: 18 })
    }

    return list
  }, [ethBalance, tokensData])

  const [token, setToken] = useState<SendableToken>(available[0])

  // If the selected token is no longer in the wallet (e.g. just sent it),
  // snap back to the first available option.
  useEffect(() => {
    const stillPresent = available.some(
      (t) => t.address === token.address && t.symbol === token.symbol,
    )
    if (!stillPresent) setToken(available[0])
  }, [available, token])

  // Balance for the selected token (native if address === "", else ERC-20).
  // Native ETH is reused from above instead of refetching.
  const { data: erc20Balance } = useBalance({
    address: from,
    chainId: base.id,
    token: token.address === "" ? undefined : (token.address as `0x${string}`),
    query: { enabled: !!from && token.address !== "" },
  })
  const balance = token.address === "" ? ethBalance : erc20Balance

  // Two independent paths: native ETH via sendTransaction, ERC-20 via writeContract.
  const {
    data: ethHash,
    isPending: ethPending,
    error: ethError,
    sendTransaction,
    reset: resetEth,
  } = useSendTransaction()

  const {
    data: erc20Hash,
    isPending: erc20Pending,
    error: erc20Error,
    writeContract,
    reset: resetErc20,
  } = useWriteContract()

  const hash = ethHash ?? erc20Hash
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash, chainId: base.id })

  const pending = ethPending || erc20Pending
  const error = ethError ?? erc20Error

  const recipientValid = isAddress(recipient.trim())
  const amountValid = useMemo(() => {
    try {
      if (!amount) return false
      const parsed = parseUnits(amount, token.decimals)
      return parsed > 0n
    } catch {
      return false
    }
  }, [amount, token.decimals])

  const canSubmit = !!from && recipientValid && amountValid && !pending && !confirming

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !from) return
    if (chainId !== base.id) {
      try {
        await switchChainAsync({ chainId: base.id })
      } catch {
        return
      }
    }

    const to = recipient.trim() as `0x${string}`

    if (token.address === "") {
      sendTransaction({
        chainId: base.id,
        to,
        value: parseEther(amount),
      })
    } else {
      writeContract({
        chainId: base.id,
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, parseUnits(amount, token.decimals)],
      })
    }
  }

  function reset() {
    setRecipient("")
    setAmount("")
    resetEth()
    resetErc20()
  }

  const balanceLabel = balance
    ? `${Number.parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)}`
    : "—"

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-[95%] w-full sm:max-w-md p-5 sm:p-6 border-0"
        style={{ background: "#1F1D20", borderColor: "#1F1D20" }}
      >
        <DialogHeader className="pb-1">
          <DialogTitle className="font-mono text-sm tracking-tight text-slate-100">
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-[#4B7F9B]">send</span>{" "}
            <span className="text-slate-300">--chain base</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            transfer · onchain
          </DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div
            className="rounded-md border p-4 font-mono text-sm text-emerald-400"
            style={{ background: "#1a1a1e", borderColor: "#1F1D20" }}
          >
            <div className="mb-1">✓ broadcast confirmed</div>
            <a
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-[#4B7F9B]"
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
            >
              view on basescan <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Token picker */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                asset
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {available.map((t) => {
                  const isActive = token.symbol === t.symbol && token.address === t.address
                  return (
                    <button
                      key={`${t.symbol}-${t.address}`}
                      type="button"
                      onClick={() => setToken(t)}
                      className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                        isActive
                          ? "border-[#4B7F9B] text-[#4B7F9B]"
                          : "border-[#2a282c] text-slate-400 hover:border-[#4B7F9B]/50 hover:text-slate-100"
                      }`}
                      style={{ background: "#1a1a1e" }}
                      title={t.name}
                    >
                      <span className="truncate">{t.symbol}</span>
                    </button>
                  )
                })}
              </div>
              {available.length === 1 && available[0].symbol === "ETH" && ethBalance?.value === 0n && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  wallet empty · deposit assets first
                </p>
              )}
            </div>

            {/* Recipient */}
            <div>
              <label className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <span>recipient</span>
                {recipient && !recipientValid && (
                  <span className="text-rose-400">invalid address</span>
                )}
              </label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x…"
                spellCheck={false}
                className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm text-slate-100 outline-none transition-colors focus:border-[#4B7F9B]/60"
                style={{ background: "#1a1a1e", borderColor: "#2a282c" }}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <span>amount · {token.symbol}</span>
                <button
                  type="button"
                  onClick={() => balance && setAmount(formatUnits(balance.value, balance.decimals))}
                  className="text-slate-400 transition-colors hover:text-[#4B7F9B]"
                >
                  bal: {balanceLabel} · max
                </button>
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm text-slate-100 outline-none transition-colors focus:border-[#4B7F9B]/60"
                style={{ background: "#1a1a1e", borderColor: "#2a282c" }}
              />
            </div>

            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-2 font-mono text-[11px] text-rose-400">
                {(error as Error).message?.split("\n")[0] ?? "transaction failed"}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-11 w-full justify-center rounded-md border border-[#4B7F9B]/40 font-mono text-[11px] uppercase tracking-[0.18em] text-[#4B7F9B] transition-colors hover:bg-[#4B7F9B]/10 disabled:opacity-40"
              style={{ background: "#1a1a1e" }}
            >
              {pending || confirming ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {confirming ? "confirming…" : "awaiting signature…"}
                </>
              ) : (
                <>
                  <SendHorizontal className="mr-2 h-3.5 w-3.5" />
                  send {token.symbol}
                </>
              )}
            </Button>

            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              sent on base · chain_id 8453
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
