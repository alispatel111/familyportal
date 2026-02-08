"use client"

import React, { useState } from "react"

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

// 分离的现代错误页面组件
const ErrorFallback = ({ error, onReload }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  const handleReload = () => {
    setIsReloading(true)
    setTimeout(() => {
      onReload()
    }, 300)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-red-100 to-pink-100 opacity-70 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 opacity-70 blur-3xl" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative mx-auto max-w-lg">
        {/* 卡片容器 */}
        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl">
          {/* 装饰性顶部条 */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
          
          {/* 内容 */}
          <div className="px-6 py-8 sm:p-10">
            {/* 图标动画 */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-200 opacity-75"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Something went wrong
            </h1>
            
            <p className="mb-6 text-center text-gray-600">
              We encountered an unexpected error. Please try reloading the page.
            </p>

            {/* 错误详情 */}
            <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <span className="font-medium text-gray-700">Error Details</span>
                <svg 
                  className={`h-5 w-5 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDetails && (
                <div className="animate-slideDown border-t border-gray-200 px-4 py-3">
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-sm text-gray-700 font-mono">
                    {error?.toString() || 'No error details available'}
                  </pre>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 text-center font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isReloading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Reloading...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reload Page
                    </>
                  )}
                </span>
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
              >
                Go Back
              </button>
            </div>

            {/* 额外帮助文本 */}
            <p className="mt-6 text-center text-sm text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary