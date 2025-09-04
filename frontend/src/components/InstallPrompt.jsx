"use client"

import { useState, useEffect } from "react"
import { initPWAInstall, installApp } from "../utils/pwaInstall"

const InstallPrompt = () => {
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    initPWAInstall()

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstall(false)
    } else {
      // Show install prompt after 3 seconds
      setTimeout(() => setShowInstall(true), 3000)
    }
  }, [])

  const handleInstall = () => {
    installApp()
    setShowInstall(false)
  }

  if (!showInstall) return null

  return (
    <div
      className="install-prompt"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        background: "#007bff",
        color: "white",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "16px" }}>Install Family Portal</h4>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>Install our app for better experience!</p>
        </div>
        <div>
          <button
            onClick={handleInstall}
            style={{
              background: "white",
              color: "#007bff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            Install
          </button>
          <button
            onClick={() => setShowInstall(false)}
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid white",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
