"use client"

import { useState, useEffect } from "react"

let toastId = 0

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Global toast function
    window.showToast = (type, title, message, duration) => {
      const id = ++toastId
      const newToast = { id, type, title, message, duration }
      setToasts((prev) => [...prev, newToast])
    }

    return () => {
      delete window.showToast
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastItem = ({ id, type, title, message, duration = 5000, onRemove }) => {
    const [isRemoving, setIsRemoving] = useState(false)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
      const timer = setTimeout(() => {
        handleRemove()
      }, duration)

      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 100)
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 100)

      return () => {
        clearTimeout(timer)
        clearInterval(progressTimer)
      }
    }, [duration])

    const handleRemove = () => {
      setIsRemoving(true)
      setTimeout(() => {
        onRemove(id)
      }, 300)
    }

    const getIcon = () => {
      switch (type) {
        case "success":
          return <i className="fas fa-check-circle"></i>
        case "error":
          return <i className="fas fa-exclamation-circle"></i>
        case "warning":
          return <i className="fas fa-exclamation-triangle"></i>
        case "info":
          return <i className="fas fa-info-circle"></i>
        default:
          return <i className="fas fa-bell"></i>
      }
    }

    return (
      <div
        className={`relative flex items-start gap-3 rounded-xl border p-4 pr-8 shadow transition ${type === "success" ? "border-green-200 bg-green-50 text-green-800" : type === "error" ? "border-red-200 bg-red-50 text-red-800" : type === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-200 bg-blue-50 text-blue-800"} ${isRemoving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
      >
        <div className="text-lg">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          {message && <div className="text-sm opacity-90">{message}</div>}
        </div>
        <button className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-white/60" onClick={handleRemove}>
          <i className="fas fa-times"></i>
        </button>
        <div
          className="absolute bottom-0 left-0 h-1 rounded-br-xl rounded-bl-xl bg-black/10"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-h-[calc(100vh-2rem)] w-full max-w-sm flex-col gap-3 overflow-y-auto">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer