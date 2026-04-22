"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, Copy, ArrowUpRight } from "lucide-react"

type Props = { trigger: React.ReactNode; address: string }

/**
 * Receive panel: wallet address + matching QR code. Rendered as an SVG
 * generated at runtime so it inherits crisp scaling and picks up the
 * brassey palette (steel blue on the near-black terminal body).
 */
export function ReceiveModal({ trigger, address }: Props) {
  const [open, setOpen] = useState(false)
  const [svg, setSvg] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!address) return
    let cancelled = false
    QRCode.toString(address, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#EBF0F5", light: "#00000000" }, // foreground on transparent
    })
      .then((s) => {
        if (!cancelled) setSvg(s)
      })
      .catch(() => {
        if (!cancelled) setSvg("")
      })
    return () => {
      cancelled = true
    }
  }, [address])

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* noop */
    }
  }

  const formatAddress = (addr: string) =>
    addr ? `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}` : ""

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-[95%] w-full sm:max-w-md p-5 sm:p-6 border-0"
        style={{ background: "#1F1D20", borderColor: "#1F1D20" }}
      >
        <DialogHeader className="pb-1">
          <DialogTitle className="font-mono text-sm tracking-tight text-slate-100">
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-[#4B7F9B]">receive</span>{" "}
            <span className="text-slate-300">--chain base</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            deposit · scan or copy
          </DialogDescription>
        </DialogHeader>

        {/* QR */}
        <div className="flex justify-center py-2">
          <div
            className="relative rounded-md border p-3"
            style={{ background: "#0f0e10", borderColor: "#2a282c" }}
          >
            {svg ? (
              <div
                aria-label="Wallet QR code"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: QR SVG is locally generated.
                dangerouslySetInnerHTML={{ __html: svg }}
                style={{ width: 208, height: 208 }}
              />
            ) : (
              <div
                style={{ width: 208, height: 208 }}
                className="animate-pulse rounded-sm bg-slate-800/40"
              />
            )}
            {/* tiny Base logo center overlay */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md border"
                style={{ background: "#1F1D20", borderColor: "#2a282c" }}
              >
                <span className="text-[#4B7F9B]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm-.1 18.9A6.9 6.9 0 0 1 5 12.6h13.78A6.9 6.9 0 0 1 11.9 18.9Z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-1">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            wallet · base mainnet
          </div>
          <div
            className="flex items-center gap-2 rounded-md border px-3 py-2"
            style={{ background: "#1a1a1e", borderColor: "#2a282c" }}
          >
            <span className="truncate font-mono text-[12px] text-slate-200">{address}</span>
            <button
              onClick={copy}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:border-[#4B7F9B]/50 hover:text-[#4B7F9B]"
              style={{ background: "#1F1D20", borderColor: "#2a282c" }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <span>only send assets on base</span>
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[#4B7F9B]"
            >
              basescan · {formatAddress(address)} <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
