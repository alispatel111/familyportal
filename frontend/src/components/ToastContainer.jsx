"use client"

import { useState, useEffect } from "react"
import Toast from "./Toast"

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

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

export default ToastContainer
