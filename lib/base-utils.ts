// Direct API utilities for Base network

/**
 * Fetches a basename (ENS name) for an address on Base
 * @param address Ethereum address
 * @returns Promise with the basename or null
 */
export async function fetchBasename(address: string): Promise<string | null> {
  if (!address) return null

  try {
    // Log the attempt
    console.log(`Attempting to fetch basename for ${address}`)

    // Use the Base RPC endpoint directly
    const response = await fetch("https://mainnet.base.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // ENS Registry
            data: `0x0178b8bf${address.slice(2).padStart(64, "0")}`, // namehash
          },
          "latest",
        ],
      }),
    })

    const data = await response.json()
    console.log("ENS response:", data)

    if (
      data.result &&
      data.result !== "0x" &&
      data.result !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      // Further resolve the name
      // This is simplified - in a real implementation you'd need to resolve the name from the resolver
      const nameResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}?network=base`)
      const nameData = await nameResponse.json()
      console.log("ENS name data:", nameData)

      if (nameData.name) {
        console.log(`Found basename: ${nameData.name}`)
        return nameData.name
      }
    }

    console.log("No basename found")
    return null
  } catch (error) {
    console.error("Error fetching basename:", error)
    return null
  }
}

/**
 * Gets the avatar URL for a Base address
 * @param address Ethereum address
 * @returns Avatar URL
 */
export function getBaseAvatarUrl(address: string): string {
  if (!address) return ""

  // Try multiple avatar services
  const services = [
    // Stamp.fyi service
    `https://cdn.stamp.fyi/avatar/eth:${address.toLowerCase()}?s=128`,
    // ENS Avatar service
    `https://avatar.vercel.sh/${address.toLowerCase()}`,
    // Ethereum Blockies
    `https://effigy.im/a/${address.toLowerCase()}.svg`,
  ]

  // Return the first service by default
  return services[0]
}

/**
 * Generates a fallback avatar URL based on the address
 * @param address Ethereum address
 * @returns Fallback avatar URL
 */
export function getFallbackAvatarUrl(address: string): string {
  if (!address) return ""
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`
}

/**
 * Formats an address for display (e.g., 0x1234...5678)
 * @param address Ethereum address
 * @returns Formatted address string
 */
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
