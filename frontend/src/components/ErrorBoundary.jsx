"use client"

import React, { useState } from "react"
import { 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  ChevronDown, 
  Terminal, 
  LifeBuoy, 
  ShieldAlert 
} from "lucide-react"

// --- LOGIC: Class Component (Required for Error Boundaries) ---
// No logic changes made here, exactly as requested.
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
        <ErrorFallback 
          error={this.state.error} 
          onReload={() => window.location.reload()} 
        />
      )
    }
    return this.props.children
  }
}

// --- UI: Modern Functional Component ---
const ErrorFallback = ({ error, onReload }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  const handleReload = () => {
    setIsReloading(true)
    // Simulating a smooth reload transition
    setTimeout(() => {
      onReload()
    }, 800)
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Abstract Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-700" />
      </div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 ring-1 ring-gray-900/5 transition-all duration-500 ease-out animate-in fade-in zoom-in-95">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-b-full opacity-80" />

        <div className="p-6 sm:p-10">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25" />
              <div className="relative flex items-center justify-center h-20 w-20 bg-red-50 rounded-2xl border border-red-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <ShieldAlert className="h-10 w-10 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Application Error
            </h1>
            <p className="text-gray-500 text-base max-w-sm leading-relaxed">
              We encountered an unexpected issue. Our team has been notified, but you may need to reload the page.
            </p>
          </div>

          {/* Error Details Accordion */}
          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-all duration-200 rounded-xl border ${
                showDetails 
                  ? 'bg-gray-50 border-gray-200 text-gray-900 rounded-b-none' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
              }`}
            >
              <span className="flex items-center gap-2">
                <Terminal size={16} className="text-gray-400" />
                View Error Details
              </span>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out border-x border-b border-gray-200 rounded-b-xl bg-gray-900 ${
                showDetails ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-none'
              }`}
            >
              <div className="p-4 overflow-auto custom-scrollbar">
                <pre className="text-xs font-mono text-red-200 break-words whitespace-pre-wrap leading-relaxed">
                  <span className="text-gray-500 select-none">$ error_log: </span>
                  {error?.toString() || 'Unknown Error Occurred'}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 focus:ring-4 focus:ring-gray-900/10 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 transition-opacity group-hover:opacity-90" />
              <div className="relative flex items-center gap-2">
                <RefreshCw size={18} className={`${isReloading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isReloading ? 'Reloading...' : 'Reload Page'}
              </div>
            </button>
          </div>

          {/* Footer Help */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <a href="#" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <LifeBuoy size={14} />
              Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary