"use client"

export function WalletIdentity({ address }: { address: string }) {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Generate a deterministic avatar URL based on the address
  const generateAvatarUrl = (addr: string) => {
    if (!addr) return ""
    return `https://source.boringavatars.com/marble/120/${addr}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full overflow-hidden">
        <img
          src={generateAvatarUrl(address) || "/placeholder.svg"}
          alt="Avatar"
          className="h-12 w-12 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.classList.add("bg-primary/10", "flex", "items-center", "justify-center")
              const icon = document.createElement("div")
              icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-6 w-6 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
              parent.appendChild(icon)
            }
          }}
        />
      </div>
      <div>
        <div className="font-medium">{formatAddress(address)}</div>
        <div className="text-sm text-muted-foreground">Base Network</div>
      </div>
    </div>
  )
}
