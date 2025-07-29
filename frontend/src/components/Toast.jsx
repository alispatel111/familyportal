"use client"

import { useState, useEffect } from "react"
import "../styles/toast.css"

const Toast = ({ id, type, title, message, duration = 5000, onRemove }) => {
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
    <div className={`toast ${type} ${isRemoving ? "removing" : ""}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button className="toast-close" onClick={handleRemove}>
        <i className="fas fa-times"></i>
      </button>
      <div className="toast-progress" style={{ width: `${progress}%` }}></div>
    </div>
  )
}

export default Toast
