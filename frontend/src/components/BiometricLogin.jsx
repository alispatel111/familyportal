"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BiometricLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState("")
  const [step, setStep] = useState("preparing") // Start with preparing step

  useEffect(() => {
    console.log("🔐 BiometricLogin component mounted - starting immediate auth")
    // Small delay to ensure component is fully mounted
    setTimeout(() => {
      startImmediateBiometricAuth()
    }, 100)
  }, [])

  const startImmediateBiometricAuth = async () => {
    console.log("🚀 Starting immediate biometric authentication...")
    setLoading(true)
    setError("")
    setStep("authenticating")

    try {
      console.log("📡 Calling immediate biometric login API...")

      // Call the immediate biometric login endpoint
      const response = await axios.post("/api/auth/biometric/login/immediate")
      const { publicKeyCredentialRequestOptions } = response.data

      console.log("✅ Immediate biometric options received:", publicKeyCredentialRequestOptions)
      console.log("👥 User count:", response.data.userCount)

      if (!publicKeyCredentialRequestOptions) {
        throw new Error("No biometric options received from server")
      }

      // Immediately start biometric authentication
      await performBiometricAuth(publicKeyCredentialRequestOptions)
    } catch (error) {
      console.error("❌ Immediate biometric login failed:", error)

      if (error.response?.status === 400) {
        setError("No biometric authentication setup found. Please setup biometric first or use password login.")
      } else {
        setError(error.response?.data?.message || "Biometric authentication failed. Please try again.")
      }

      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const performBiometricAuth = async (options) => {
    try {
      console.log("🔐 Performing WebAuthn authentication...")
      setStep("biometric-prompt")

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
        console.log(`🔑 Converting ${options.allowCredentials.length} credential IDs...`)

        options.allowCredentials = options.allowCredentials.map((cred, index) => {
          try {
            console.log(`🔑 Converting credential ${index + 1}:`, cred.id)

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

            console.log(`✅ Credential ${index + 1} converted successfully`)
            return {
              ...cred,
              id: credentialIdBytes,
            }
          } catch (e) {
            console.error(`❌ Credential ${index + 1} conversion error:`, e)
            throw new Error(`Invalid credential ID format: ${e.message}`)
          }
        })
      } else {
        throw new Error("No credentials available for authentication")
      }

      console.log("🔐 Starting WebAuthn credential.get()...")

      // Get credential using WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: options,
      })

      console.log("✅ WebAuthn authentication successful!")
      console.log("📋 Credential received:", credential)

      setStep("verifying")

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

      console.log("🎉 Login verification successful!")
      console.log("👤 User logged in:", verifyResponse.data.user)

      setStep("success")

      // Small delay to show success state
      setTimeout(() => {
        onLogin(verifyResponse.data.user)
      }, 500)
    } catch (error) {
      console.error("❌ Biometric authentication failed:", error)

      let errorMessage = "Biometric authentication failed"

      if (error.name === "NotAllowedError") {
        errorMessage = "Biometric authentication was cancelled or denied"
      } else if (error.name === "SecurityError") {
        errorMessage = "Security error during biometric authentication"
      } else if (error.name === "NetworkError") {
        errorMessage = "Network error during authentication"
      } else if (error.name === "InvalidCharacterError" || error.message.includes("Invalid credential ID format")) {
        errorMessage = "Invalid credential data. Please try password login."
      } else if (error.response?.status === 400) {
        errorMessage = "Biometric credential not recognized. Please try password login."
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setError(errorMessage)
      setStep("error")
    }
  }

  const retryBiometric = () => {
    console.log("🔄 Retrying biometric authentication...")
    setError("")
    startImmediateBiometricAuth()
  }

  const renderContent = () => {
    switch (step) {
      case "preparing":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">⏳</div>
            </div>
            <h3>🔐 Preparing Biometric Login</h3>
            <p>Setting up biometric authentication...</p>
          </>
        )

      case "authenticating":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">🔍</div>
            </div>
            <h3>🔐 Checking Biometric Setup</h3>
            <p>Looking for registered biometric credentials...</p>
          </>
        )

      case "biometric-prompt":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">👆</div>
            </div>
            <h3>🔐 Biometric Authentication</h3>
            <p>
              <strong>Please use your fingerprint, face, or device authentication now!</strong>
            </p>
            <div className="biometric-status">
              <p>
                ✨ <strong>Ready for authentication</strong>
              </p>
              <p>👆 Touch your fingerprint sensor</p>
              <p>👤 Use face recognition if available</p>
              <p>🔢 Enter device PIN if prompted</p>
            </div>
          </>
        )

      case "verifying":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">⚡</div>
            </div>
            <h3>🔐 Verifying Authentication</h3>
            <p>Processing your biometric data...</p>
          </>
        )

      case "success":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">✅</div>
            </div>
            <h3>🎉 Authentication Successful!</h3>
            <p>Logging you in...</p>
          </>
        )

      case "error":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">❌</div>
            </div>
            <h3>🔐 Authentication Failed</h3>
            <p>Unable to authenticate with biometrics</p>
            {error && <div className="error-message">{error}</div>}
          </>
        )

      default:
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">👆</div>
            </div>
            <h3>🔐 Biometric Authentication</h3>
            <p>Please use your biometric authentication</p>
          </>
        )
    }
  }

  return (
    <div className="biometric-login">
      <div className="biometric-prompt">
        {renderContent()}

        <div className="biometric-actions">
          {step === "error" && (
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
            💡 <strong>Instant Biometric Login:</strong>
          </p>
          <ul>
            <li>✨ No username required</li>
            <li>👆 Just use your biometric</li>
            <li>🚀 Automatic user identification</li>
            <li>⚡ Fastest login method</li>
          </ul>

          {step === "error" && (
            <div className="troubleshoot-section">
              <p>
                🔧 <strong>Troubleshooting:</strong>
              </p>
              <ul>
                <li>Ensure biometric is setup in Settings</li>
                <li>Check device screen lock is enabled</li>
                <li>Try clearing browser cache</li>
                <li>Use password login as backup</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BiometricLogin
