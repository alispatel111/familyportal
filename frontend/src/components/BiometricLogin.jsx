"use client"

import { useState } from "react"
import axios from "axios"

const BiometricLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [step, setStep] = useState("username") // 'username' or 'biometric'

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Please enter your username or email")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("🔐 Initiating biometric login for:", username)

      const response = await axios.post("/api/auth/biometric/login", { username })
      const { publicKeyCredentialRequestOptions } = response.data

      console.log("📋 Login options received:", publicKeyCredentialRequestOptions)
      setStep("biometric")

      // Automatically start biometric authentication
      await performBiometricAuth(publicKeyCredentialRequestOptions)
    } catch (error) {
      console.error("❌ Biometric login initiation failed:", error)
      setError(error.response?.data?.message || "Failed to initiate biometric login")
    } finally {
      setLoading(false)
    }
  }

  const performBiometricAuth = async (options) => {
    try {
      console.log("🚀 Starting biometric authentication...")
      console.log("Original options:", options)

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

      // Send credential to server for verification
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
        setError("Invalid credential data. Please disable and re-enable biometric authentication.")
      } else if (error.response?.status === 400) {
        setError("Biometric authentication failed. Please try password login or re-setup biometric.")
      } else {
        setError(error.message || error.response?.data?.message || "Biometric authentication failed")
      }

      setStep("username") // Go back to username step
    }
  }

  const retryBiometric = () => {
    setError("")
    setStep("username")
  }

  if (step === "biometric") {
    return (
      <div className="biometric-login">
        <div className="biometric-prompt">
          <div className="biometric-icon">
            <div className="fingerprint-animation">👆</div>
          </div>

          <h3>🔐 Biometric Authentication</h3>
          <p>Please use your fingerprint, face, or device authentication</p>

          {error && <div className="error-message">{error}</div>}

          <div className="biometric-actions">
            <button onClick={retryBiometric} className="btn btn-outline">
              🔄 Try Again
            </button>
            <button onClick={onCancel} className="btn btn-secondary">
              ❌ Cancel
            </button>
          </div>

          <div className="biometric-help">
            <p>
              💡 <strong>Troubleshooting:</strong>
            </p>
            <ul>
              <li>Make sure your finger is clean and dry</li>
              <li>Position your finger correctly on the sensor</li>
              <li>Try using face recognition if available</li>
              <li>If error persists, disable and re-enable biometric in settings</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="biometric-login">
      <div className="biometric-form">
        <h3>🔐 Biometric Login</h3>
        <p>Enter your username to start biometric authentication</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleUsernameSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "⏳ Preparing..." : "🚀 Start Biometric Login"}
            </button>

            <button type="button" onClick={onCancel} className="btn btn-outline">
              ← Back to Password Login
            </button>
          </div>
        </form>

        <div className="biometric-info">
          <h4>🛡️ Secure & Fast</h4>
          <p>Biometric authentication provides enhanced security and faster access to your account.</p>

          <div className="biometric-troubleshoot">
            <h4>🔧 If biometric login fails:</h4>
            <ol>
              <li>Go to Biometric Settings</li>
              <li>Disable biometric authentication</li>
              <li>Re-enable it to refresh credentials</li>
              <li>Try biometric login again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiometricLogin
