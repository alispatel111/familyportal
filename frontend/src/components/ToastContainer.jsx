"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"

let toastId = 0

const ToastItem = ({ id, type, title, message, duration = 5000, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const timer = setTimeout(() => onRemove(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onRemove, isHovered])

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-500",
      border: "border-emerald-100/50",
      shadow: "shadow-emerald-500/10"
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-500",
      border: "border-rose-100/50",
      shadow: "shadow-rose-500/10"
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-500",
      border: "border-amber-100/50",
      shadow: "shadow-amber-500/10"
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-500",
      border: "border-blue-100/50",
      shadow: "shadow-blue-500/10"
    }
  }

  const current = config[type] || config.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden pointer-events-auto
        w-full md:max-w-[380px] min-h-[70px]
        flex items-center gap-4 p-4 mb-2
        bg-white/80 backdrop-blur-md border ${current.border}
        rounded-2xl shadow-2xl ${current.shadow}
      `}
    >
      {/* Icon Section */}
      <div className="flex-shrink-0 p-2 rounded-xl bg-white shadow-sm border border-gray-50">
        {current.icon}
      </div>
      
      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-bold text-gray-800 tracking-tight leading-tight">
          {title}
        </h4>
        {message && (
          <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-snug">
            {message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Modern Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100/50">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: isHovered ? "inherit" : "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-full ${current.color}`}
        />
      </div>
    </motion.div>
  )
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    window.showToast = (type, title, message, duration = 5000) => {
      const id = ++toastId
      // Keep only last 5 toasts to prevent screen clutter
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }])
    }
    return () => { delete window.showToast }
  }, [])

  return (
    <div className="
      fixed z-[99999]
      /* Mobile: Bottom Center */
      bottom-4 left-4 right-4 
      /* Desktop: Top Right */
      md:top-6 md:right-6 md:left-auto md:bottom-auto
      flex flex-col gap-1 pointer-events-none
    ">
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
}

export default ToastContainer