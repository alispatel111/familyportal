"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BiometricLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState("biometric") // Start directly with biometric

  useEffect(() => {
    // Automatically start biometric authentication when component mounts
    startBiometricAuth()
  }, [])

  const startBiometricAuth = async () => {
    setLoading(true)
    setError("")

    try {
      console.log("🔐 Starting immediate biometric authentication...")

      // Get biometric options for all registered users
      const response = await axios.post("/api/auth/biometric/login/immediate")
      const { publicKeyCredentialRequestOptions } = response.data

      console.log("📋 Immediate biometric options received:", publicKeyCredentialRequestOptions)

      // Immediately start biometric authentication
      await performBiometricAuth(publicKeyCredentialRequestOptions)
    } catch (error) {
      console.error("❌ Immediate biometric login failed:", error)
      setError(error.response?.data?.message || "Biometric authentication not available")
    } finally {
      setLoading(false)
    }
  }

  const performBiometricAuth = async (options) => {
    try {
      console.log("🚀 Performing biometric authentication...")
      console.log("Options received:", options)

      // Convert challenge from base64 string to Uint8Array
      const challengeString = options.challenge
      if (!challengeString) {
        throw new Error("No challenge received from server")
      }

      try {
        // Ensure proper base64 padding
        const paddedChallenge = challengeString.padEnd(
          challengeString.length + ((4 - (challengeString.length % 4)) % 4),
          "=",
        )
        options.challenge = Uint8Array.from(atob(paddedChallenge), (c) => c.charCodeAt(0))
        console.log("✅ Challenge converted successfully")
      } catch (e) {
        console.error("❌ Challenge conversion error:", e)
        throw new Error("Invalid challenge format received from server")
      }

      // Convert allowCredentials id from base64 string to Uint8Array
      if (options.allowCredentials && options.allowCredentials.length > 0) {
        options.allowCredentials = options.allowCredentials.map((cred) => {
          try {
            console.log("🔑 Converting credential ID:", cred.id)

            // Handle different credential ID formats
            let credentialIdBytes
            if (typeof cred.id === "string") {
              // Ensure proper base64 padding
              const paddedCredId = cred.id.padEnd(cred.id.length + ((4 - (cred.id.length % 4)) % 4), "=")
              credentialIdBytes = Uint8Array.from(atob(paddedCredId), (c) => c.charCodeAt(0))
            } else if (Array.isArray(cred.id)) {
              // If it's already an array, convert to Uint8Array
              credentialIdBytes = new Uint8Array(cred.id)
            } else {
              throw new Error("Unknown credential ID format")
            }

            console.log("✅ Credential ID converted successfully")
            return {
              ...cred,
              id: credentialIdBytes,
            }
          } catch (e) {
            console.error("❌ Credential ID conversion error:", e)
            console.error("Credential ID value:", cred.id)
            console.error("Credential ID type:", typeof cred.id)
            throw new Error("Invalid credential ID format: " + e.message)
          }
        })
      }

      console.log("🔐 Processed options:", options)

      // Get credential using WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: options,
      })

      console.log("✅ Biometric authentication successful")
      console.log("Credential received:", credential)

      // Send credential to server for verification and user identification
      const verificationData = {
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            signature: Array.from(new Uint8Array(credential.response.signature)),
            userHandle: credential.response.userHandle
              ? Array.from(new Uint8Array(credential.response.userHandle))
              : null,
          },
          type: credential.type,
        },
      }

      console.log("📤 Sending verification data to server...")
      const verifyResponse = await axios.post("/api/auth/biometric/login/verify", verificationData)

      console.log("🎉 Login verification successful")
      onLogin(verifyResponse.data.user)
    } catch (error) {
      console.error("❌ Biometric authentication failed:", error)

      if (error.name === "NotAllowedError") {
        setError("Biometric authentication was cancelled or failed")
      } else if (error.name === "SecurityError") {
        setError("Security error during biometric authentication")
      } else if (error.name === "NetworkError") {
        setError("Network error during authentication")
      } else if (error.name === "InvalidCharacterError" || error.message.includes("Invalid credential ID format")) {
        setError("Invalid credential data. Please try again or use password login.")
      } else if (error.response?.status === 400) {
        setError("No registered biometric found. Please setup biometric authentication first.")
      } else {
        setError(error.message || error.response?.data?.message || "Biometric authentication failed")
      }
    }
  }

  const retryBiometric = () => {
    setError("")
    startBiometricAuth()
  }

  return (
    <div className="biometric-login">
      <div className="biometric-prompt">
        <div className="biometric-icon">
          <div className="fingerprint-animation">{loading ? "⏳" : error ? "❌" : "👆"}</div>
        </div>

        <h3>🔐 Biometric Authentication</h3>
        {loading ? (
          <p>Preparing biometric authentication...</p>
        ) : error ? (
          <p>Authentication failed. Please try again.</p>
        ) : (
          <p>Please use your fingerprint, face, or device authentication</p>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="biometric-actions">
          {error && (
            <button onClick={retryBiometric} className="btn btn-primary" disabled={loading}>
              {loading ? "⏳ Preparing..." : "🔄 Try Again"}
            </button>
          )}
          <button onClick={onCancel} className="btn btn-secondary">
            ← Back to Password Login
          </button>
        </div>

        <div className="biometric-help">
          <p>
            💡 <strong>Quick Authentication:</strong>
          </p>
          <ul>
            <li>✨ No username required - just use your biometric</li>
            <li>👆 Touch your fingerprint sensor</li>
            <li>👤 Use face recognition if available</li>
            <li>🔢 Enter device PIN/password if prompted</li>
            <li>🚀 Automatic login after verification</li>
          </ul>

          {error && (
            <div className="troubleshoot-section">
              <p>
                🔧 <strong>Troubleshooting:</strong>
              </p>
              <ul>
                <li>Make sure biometric is setup in Settings</li>
                <li>Ensure device screen lock is enabled</li>
                <li>Try using password login as backup</li>
                <li>Clear browser cache if issues persist</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BiometricLogin
