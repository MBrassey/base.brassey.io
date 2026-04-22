/**
 * Tokens the Send modal can transfer. Native ETH has no contract address.
 * ERC-20 transfers go through `transfer(address,uint256)`.
 */
export type SendableToken = {
  symbol: string
  name: string
  /** Empty string for native ETH, otherwise the ERC-20 contract. */
  address: "" | `0x${string}`
  decimals: number
}

export const SENDABLE_TOKENS: SendableToken[] = [
  { symbol: "ETH", name: "Ether", address: "", decimals: 18 },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
  },
]
