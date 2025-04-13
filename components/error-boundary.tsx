"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { FallbackError } from "./fallback-error"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  fallbackTitle?: string
  fallbackDescription?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    
    // Call optional onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Log specific error types to help with debugging
    if (error.message.includes("Referrer") || error.message.includes("URL")) {
      console.warn("Network error detected when loading identity components:", error.message)
    }
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // Otherwise use our default FallbackError component
      return (
        <FallbackError
          error={this.state.error || null}
          resetErrorBoundary={this.resetErrorBoundary}
          title={this.props.fallbackTitle}
          description={this.props.fallbackDescription}
        />
      )
    }

    return this.props.children
  }
}
