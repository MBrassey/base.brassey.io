"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface FallbackErrorProps {
  error: Error | null
  resetErrorBoundary?: () => void
  title?: string
  description?: string
}

export function FallbackError({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  description,
}: FallbackErrorProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description || error?.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        {resetErrorBoundary ? (
          <Button 
            variant="default" 
            onClick={resetErrorBoundary}
            className="mr-2"
          >
            Try Again
          </Button>
        ) : null}
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  )
} 