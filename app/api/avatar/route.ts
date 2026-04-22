import { NextResponse } from "next/server"
import {
  createPublicClient,
  http,
  namehash,
  keccak256,
  encodePacked,
  stringToBytes,
} from "viem"
import { normalize } from "viem/ens"
import { base } from "viem/chains"
import {
  L2_RESOLVER_ABI,
  L2_RESOLVER_ADDRESS,
  BASE_DEFAULT_PROFILE_PICTURES,
  defaultAvatarIndex,
} from "@/lib/basename-avatar"

export const runtime = "nodejs"
export const revalidate = 300

// ENSIP-11 cointype for Base mainnet (chainId 8453).
const COIN_TYPE_HEX = ((0x80000000 | 8453) >>> 0).toString(16).toUpperCase()

function getRpcUrl() {
  const key = process.env.ALCHEMY_API_KEY
  if (key) return `https://base-mainnet.g.alchemy.com/v2/${key}`
  return "https://mainnet.base.org"
}

const client = createPublicClient({
  chain: base,
  transport: http(getRpcUrl()),
})

function reverseNode(address: `0x${string}`): `0x${string}` {
  // ENSIP-11 reverse node: hash the lowercase hex STRING (no 0x prefix)
  // as UTF-8 bytes, then concat with the cointype.reverse root namehash.
  const hex = address.substring(2).toLowerCase()
  const addrHash = keccak256(stringToBytes(hex))
  const rootNode = namehash(`${COIN_TYPE_HEX}.reverse`)
  return keccak256(encodePacked(["bytes32", "bytes32"], [rootNode, addrHash]))
}

async function resolveBasename(address: `0x${string}`): Promise<string | null> {
  try {
    const node = reverseNode(address)
    const name = (await client.readContract({
      abi: L2_RESOLVER_ABI,
      address: L2_RESOLVER_ADDRESS,
      functionName: "name",
      args: [node],
    })) as string
    return name && name.length > 0 ? name : null
  } catch {
    return null
  }
}

async function resolveAvatarText(name: string): Promise<string | null> {
  try {
    const node = namehash(normalize(name))
    const avatar = (await client.readContract({
      abi: L2_RESOLVER_ABI,
      address: L2_RESOLVER_ADDRESS,
      functionName: "text",
      args: [node, "avatar"],
    })) as string
    return avatar && avatar.length > 0 ? avatar : null
  } catch {
    return null
  }
}

function defaultBlueFace(name: string): string {
  const idx = defaultAvatarIndex(name, BASE_DEFAULT_PROFILE_PICTURES.length)
  const svg = BASE_DEFAULT_PROFILE_PICTURES[idx]
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

/**
 * GET /api/avatar?address=0x...
 *   { name, avatar } — `avatar` is the on-chain avatar text record if set,
 *   otherwise the deterministic blue-face Basename SVG as a data URI,
 *   otherwise null (no Basename registered).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get("address")
  if (!raw) {
    return NextResponse.json({ error: "address required" }, { status: 400 })
  }
  const address = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`

  const name = await resolveBasename(address)
  if (!name) {
    return NextResponse.json(
      { name: null, avatar: null },
      { headers: { "Cache-Control": "public, s-maxage=300" } },
    )
  }

  const custom = await resolveAvatarText(name)
  const avatar = custom ?? defaultBlueFace(name)

  return NextResponse.json(
    { name, avatar },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  )
}
