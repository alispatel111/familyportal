"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/biometric.css"
import "../styles/buttons.css"

const BiometricLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [step, setStep] = useState("preparing")

  useEffect(() => {
    console.log("🔐 BiometricLogin component mounted - starting immediate auth")
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

      const response = await axios.post("/api/auth/biometric/login/immediate")
      const { publicKeyCredentialRequestOptions } = response.data

      console.log("✅ Immediate biometric options received:", publicKeyCredentialRequestOptions)
      console.log("👥 User count:", response.data.userCount)

      if (!publicKeyCredentialRequestOptions) {
        throw new Error("No biometric options received from server")
      }

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

      const challengeString = options.challenge
      if (!challengeString) {
        throw new Error("No challenge received from server")
      }

      try {
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

      if (options.allowCredentials && options.allowCredentials.length > 0) {
        console.log(`🔑 Converting ${options.allowCredentials.length} credential IDs...`)

        options.allowCredentials = options.allowCredentials.map((cred, index) => {
          try {
            console.log(`🔑 Converting credential ${index + 1}:`, cred.id)

            let credentialIdBytes
            if (typeof cred.id === "string") {
              const paddedCredId = cred.id.padEnd(cred.id.length + ((4 - (cred.id.length % 4)) % 4), "=")
              credentialIdBytes = Uint8Array.from(atob(paddedCredId), (c) => c.charCodeAt(0))
            } else if (Array.isArray(cred.id)) {
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

      const credential = await navigator.credentials.get({
        publicKey: options,
      })

      console.log("✅ WebAuthn authentication successful!")
      console.log("📋 Credential received:", credential)

      setStep("verifying")

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
              <div className="fingerprint-animation preparing">
                <i className="fas fa-hourglass-half"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-cog"></i>
              Preparing Biometric Login
            </h3>
            <p>Setting up biometric authentication...</p>
          </>
        )

      case "authenticating":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation authenticating">
                <i className="fas fa-search"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-fingerprint"></i>
              Checking Biometric Setup
            </h3>
            <p>Looking for registered biometric credentials...</p>
          </>
        )

      case "biometric-prompt":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation biometric-prompt">
                <i className="fas fa-fingerprint"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-hand-paper"></i>
              Biometric Authentication
            </h3>
            <p>
              <strong>Please use your fingerprint, face, or device authentication now!</strong>
            </p>
            <div className="biometric-status">
              <p>
                <i className="fas fa-magic"></i>
                <strong>Ready for authentication</strong>
              </p>
              <p>
                <i className="fas fa-fingerprint"></i>
                Touch your fingerprint sensor
              </p>
              <p>
                <i className="fas fa-user-circle"></i>
                Use face recognition if available
              </p>
              <p>
                <i className="fas fa-keyboard"></i>
                Enter device PIN if prompted
              </p>
            </div>
          </>
        )

      case "verifying":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation verifying">
                <i className="fas fa-sync-alt"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-shield-alt"></i>
              Verifying Authentication
            </h3>
            <p>Processing your biometric data...</p>
          </>
        )

      case "success":
        return (
          <>
            <div className="biometric-icon">
              <div className="success-tick"></div>
            </div>
            <h3>
              <i className="fas fa-check-circle"></i>
              Authentication Successful!
            </h3>
            <p>Logging you in...</p>
          </>
        )

      case "error":
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation error">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-times-circle"></i>
              Authentication Failed
            </h3>
            <p>Unable to authenticate with biometrics</p>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
          </>
        )

      default:
        return (
          <>
            <div className="biometric-icon">
              <div className="fingerprint-animation">
                <i className="fas fa-fingerprint"></i>
              </div>
            </div>
            <h3>
              <i className="fas fa-fingerprint"></i>
              Biometric Authentication
            </h3>
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
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Preparing...
                </>
              ) : (
                <>
                  <i className="fas fa-redo"></i>
                  Try Again
                </>
              )}
            </button>
          )}
          <button onClick={onCancel} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Back to Password Login
          </button>
        </div>

        <div className="biometric-help">
          <p>
            <i className="fas fa-lightbulb"></i>
            <strong>Instant Biometric Login:</strong>
          </p>
          <ul>
            <li>No username required</li>
            <li>Just use your biometric</li>
            <li>Automatic user identification</li>
            <li>Fastest login method</li>
          </ul>

          {step === "error" && (
            <div className="troubleshoot-section">
              <p>
                <i className="fas fa-tools"></i>
                <strong>Troubleshooting:</strong>
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
