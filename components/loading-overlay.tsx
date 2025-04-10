"use client"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  className?: string
  spinnerColor?: "primary" | "accent" | "white"
}

export function LoadingOverlay({
  isLoading,
  text = "Loading...",
  className,
  spinnerColor = "accent",
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-lg">
        <Spinner size="lg" color={spinnerColor} />
        {text && <p className="text-card-foreground font-medium">{text}</p>}
      </div>
    </div>
  )
} 