"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BiometricSetup = ({ user, onUpdate }) => {
  const [biometricStatus, setBiometricStatus] = useState({
    supported: false,
    enabled: false,
    available: false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    checkBiometricSupport()
    checkBiometricStatus()
  }, [])

  const checkBiometricSupport = () => {
    // Check if WebAuthn is supported
    const supported = !!(navigator.credentials && navigator.credentials.create)

    // Check if platform authenticator is available
    if (supported && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setBiometricStatus((prev) => ({
            ...prev,
            supported,
            available,
          }))
        })
        .catch(() => {
          setBiometricStatus((prev) => ({
            ...prev,
            supported,
            available: false,
          }))
        })
    } else {
      setBiometricStatus((prev) => ({
        ...prev,
        supported: false,
        available: false,
      }))
    }
  }

  const checkBiometricStatus = async () => {
    try {
      console.log("🔍 Checking biometric status...")
      const response = await axios.get("/api/auth/biometric/status")
      console.log("✅ Biometric status response:", response.data)
      setBiometricStatus((prev) => ({
        ...prev,
        enabled: response.data.biometricEnabled,
      }))
    } catch (error) {
      console.error("❌ Error checking biometric status:", error)
      if (error.response?.status === 401) {
        setError("Please login again to access biometric settings")
      }
    }
  }

  const registerBiometric = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("🔐 Starting biometric registration...")

      // Step 1: Get registration options from server
      const optionsResponse = await axios.post("/api/auth/biometric/register")
      const { publicKeyCredentialCreationOptions } = optionsResponse.data

      console.log("📋 Registration options received:", publicKeyCredentialCreationOptions)

      // Convert challenge from base64 string to Uint8Array
      const challengeString = publicKeyCredentialCreationOptions.challenge
      if (!challengeString) {
        throw new Error("No challenge received from server")
      }

      try {
        publicKeyCredentialCreationOptions.challenge = Uint8Array.from(atob(challengeString), (c) => c.charCodeAt(0))
      } catch (e) {
        console.error("Challenge conversion error:", e)
        throw new Error("Invalid challenge format received from server")
      }

      // Convert user.id from base64 string to Uint8Array
      const userIdString = publicKeyCredentialCreationOptions.user.id
      if (!userIdString) {
        throw new Error("No user ID received from server")
      }

      try {
        publicKeyCredentialCreationOptions.user.id = Uint8Array.from(atob(userIdString), (c) => c.charCodeAt(0))
      } catch (e) {
        console.error("User ID conversion error:", e)
        throw new Error("Invalid user ID format received from server")
      }

      console.log("🚀 Creating credential...")

      // Step 2: Create credential using WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })

      console.log("✅ Credential created successfully")

      // Step 3: Send credential to server for verification
      const verificationData = {
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            publicKey: credential.response.publicKey ? Array.from(new Uint8Array(credential.response.publicKey)) : null,
          },
          type: credential.type,
        },
      }

      const verifyResponse = await axios.post("/api/auth/biometric/register/verify", verificationData)

      if (verifyResponse.data.verified) {
        setMessage("🎉 Biometric authentication enabled successfully!")
        setBiometricStatus((prev) => ({ ...prev, enabled: true }))
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("❌ Biometric registration failed:", error)

      if (error.name === "NotAllowedError") {
        setError("Biometric registration was cancelled or not allowed")
      } else if (error.name === "NotSupportedError") {
        setError("Biometric authentication is not supported on this device")
      } else if (error.name === "SecurityError") {
        setError("Security error during biometric registration")
      } else if (error.name === "InvalidCharacterError") {
        setError("Invalid data format received from server. Please try again.")
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError(error.message || error.response?.data?.message || "Failed to register biometric authentication")
      }
    } finally {
      setLoading(false)
    }
  }

  const disableBiometric = async () => {
    if (!window.confirm("Are you sure you want to disable biometric authentication?")) {
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      await axios.post("/api/auth/biometric/disable")
      setMessage("Biometric authentication disabled successfully")
      setBiometricStatus((prev) => ({ ...prev, enabled: false }))
      if (onUpdate) onUpdate()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to disable biometric authentication")
    } finally {
      setLoading(false)
    }
  }

  if (!biometricStatus.supported) {
    return (
      <div className="biometric-setup">
        <div className="biometric-card">
          <h3>🔐 Biometric Authentication</h3>
          <div className="error-message">Biometric authentication is not supported on this browser or device.</div>
          <p className="biometric-info">
            To use biometric authentication, please use a modern browser like Chrome, Firefox, or Safari on a device
            with fingerprint sensor, face recognition, or other biometric capabilities.
          </p>
        </div>
      </div>
    )
  }

  if (!biometricStatus.available) {
    return (
      <div className="biometric-setup">
        <div className="biometric-card">
          <h3>🔐 Biometric Authentication</h3>
          <div className="error-message">No biometric authenticator available on this device.</div>
          <p className="biometric-info">
            Please ensure your device has fingerprint, face recognition, or PIN authentication enabled in your system
            settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="biometric-setup">
      <div className="biometric-card">
        <h3>🔐 Biometric Authentication</h3>
        <p className="biometric-description">
          Secure your account with fingerprint, face recognition, or other biometric authentication methods.
        </p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="biometric-status">
          <div className="status-item">
            <span className="status-label">Browser Support:</span>
            <span className={`status-value ${biometricStatus.supported ? "supported" : "not-supported"}`}>
              {biometricStatus.supported ? "✅ Supported" : "❌ Not Supported"}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Device Capability:</span>
            <span className={`status-value ${biometricStatus.available ? "available" : "not-available"}`}>
              {biometricStatus.available ? "✅ Available" : "❌ Not Available"}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Current Status:</span>
            <span className={`status-value ${biometricStatus.enabled ? "enabled" : "disabled"}`}>
              {biometricStatus.enabled ? "🔒 Enabled" : "🔓 Disabled"}
            </span>
          </div>
        </div>

        <div className="biometric-actions">
          {!biometricStatus.enabled ? (
            <button onClick={registerBiometric} disabled={loading} className="btn btn-primary">
              {loading ? "⏳ Setting up..." : "🔐 Enable Biometric Login"}
            </button>
          ) : (
            <button onClick={disableBiometric} disabled={loading} className="btn btn-danger">
              {loading ? "⏳ Disabling..." : "🔓 Disable Biometric Login"}
            </button>
          )}
        </div>

        <div className="biometric-info">
          <h4>📱 Supported Methods:</h4>
          <ul>
            <li>👆 Fingerprint authentication</li>
            <li>👤 Face recognition</li>
            <li>🔢 Device PIN/Password</li>
            <li>🔑 Hardware security keys</li>
          </ul>

          <h4>🛡️ Security Benefits:</h4>
          <ul>
            <li>🚀 Faster login process</li>
            <li>🔒 Enhanced security</li>
            <li>🚫 No password required</li>
            <li>📱 Device-specific authentication</li>
          </ul>

          <div className="biometric-help">
            <h4>📖 How to Enable Biometric Authentication:</h4>
            <ol>
              <li>🔐 Click "Enable Biometric Login" button</li>
              <li>👆 Follow your device's biometric prompt (fingerprint/face/PIN)</li>
              <li>✅ Confirm the authentication</li>
              <li>🎉 Biometric login is now active!</li>
            </ol>

            <h4>🔧 Troubleshooting:</h4>
            <ul>
              <li>Make sure you're logged in properly</li>
              <li>Enable device lock screen (PIN/Pattern/Password)</li>
              <li>Add fingerprint/face in device settings</li>
              <li>Use HTTPS (secure connection)</li>
              <li>Try refreshing the page if it fails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiometricSetup
