/**
 * Heuristic spam detection for tokens and NFTs.
 *
 * NFTs already come with Alchemy's `spamInfo.isSpam` classification (v3 API),
 * so we trust that directly for collectibles. Tokens don't have a first-party
 * spam flag from Alchemy on Base, so we apply these rules client-side.
 */

// Spammy strings frequently seen in airdrop/phishing ERC-20 names + symbols.
// All comparisons are lowercased.
const SPAM_PATTERNS: RegExp[] = [
  /https?:\/\//,          // URLs in the name/symbol
  /\b(www|xyz|com|net|io|app|site|club|live|online)\b/,
  /visit\s/,
  /claim\s/,
  /\bclaim\b/,
  /airdrop/,
  /reward/,
  /\bgift\b/,
  /voucher/,
  /\bfree\b/,
  /\$?\s*\d+\s*(usdc|usdt|eth|btc)\b/, // "1000 USDC" lures
  /telegram/,
  /t\.me/,
  /discord\.gg/,
  /bonus/,
  /winner/,
  /lucky/,
  /redeem/,
  /access.*code/,
  /whitelist/i,
]

// Unicode tricks often used in spam tokens (zero-width, fullwidth, etc).
const SUSPICIOUS_UNICODE = /[​-‏‪-‮⁠-⁯︀-️￰-￿]|[＀-￯]/

// Known-good token addresses on Base that should never be filtered.
const TRUSTED_TOKENS = new Set<string>([
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
  "0x4200000000000000000000000000000000000006", // WETH
  "0x236aa50979d5f3de3bd1eeb40e81137f22ab794b", // tBTC
  "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC.e (bridged)
  "0x27d2decb4bfc9c76f0309b8e88dec3a601fe25a8", // BALD
  "0xb46e0ae620efd98516f49bb00f42926d2efb6c57", // SSTO
].map((a) => a.toLowerCase()))

// Explicit denylist — contract addresses of tokens we know to be scams.
// Grows over time; kept in source so it ships with the app.
const TOKEN_DENYLIST = new Set<string>([].map((a: string) => a.toLowerCase()))

export interface TokenLike {
  contractAddress: string
  name: string
  symbol: string
  decimals: number
  balance: string
}

/** Returns true when the token looks like a spam/airdrop scam. */
export function isSpamToken(token: TokenLike): boolean {
  const addr = token.contractAddress?.toLowerCase() ?? ""
  if (TRUSTED_TOKENS.has(addr)) return false
  if (TOKEN_DENYLIST.has(addr)) return true

  const name = (token.name ?? "").toLowerCase().trim()
  const symbol = (token.symbol ?? "").toLowerCase().trim()

  // Empty metadata is a strong spam signal on its own.
  if (!name && !symbol) return true
  if (name === "unknown token" && symbol === "???") return true

  // Overly long symbols are almost always spam ("Claim your 1000 USDC at...").
  if (symbol.length > 12) return true
  if (name.length > 48) return true

  if (SUSPICIOUS_UNICODE.test(token.name) || SUSPICIOUS_UNICODE.test(token.symbol)) {
    return true
  }

  for (const pat of SPAM_PATTERNS) {
    if (pat.test(name) || pat.test(symbol)) return true
  }

  return false
}

export interface NftLike {
  name?: string
  title?: string
  description?: string
  contract?: { address?: string; name?: string }
  raw?: { metadata?: { name?: string; description?: string } }
}

/** Heuristic spam detection for NFTs (visit/claim/airdrop lures in metadata). */
export function isSpamNft(nft: NftLike): boolean {
  const pool = [
    nft.name,
    nft.title,
    nft.description,
    nft.contract?.name,
    nft.raw?.metadata?.name,
    nft.raw?.metadata?.description,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase())
    .join(" ")

  if (!pool) return false
  if (SUSPICIOUS_UNICODE.test(pool)) return true
  for (const pat of SPAM_PATTERNS) {
    if (pat.test(pool)) return true
  }
  return false
}
