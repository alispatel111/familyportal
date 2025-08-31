"use client"

import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-gray-50">
          <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold text-red-600">🚨 Something went wrong</h2>
            <p className="mb-3 text-sm text-gray-600">The application encountered an unexpected error.</p>
            <details className="mb-3 text-xs text-gray-500">
              <summary className="cursor-pointer select-none">Error Details</summary>
              <pre className="mt-1 whitespace-pre-wrap break-words">{this.state.error?.toString()}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
