"use client"

// Re-export the unified avatar implementation. The prior copy had its own
// OnchainKit wrapper with no loading timeout, which caused the "blank /
// infinite spinner" bug in the header and profile page.
export { BaseAvatar as SafeAvatar } from "./onchain-components"
