"use client"

import { useState, useEffect } from "react"
import axios from "axios"

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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 text-2xl animate-pulse shadow-inner">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-cog mr-2 text-blue-500 animate-spin"></i>
              Preparing Biometric Login
            </h3>
            <p className="text-sm text-gray-600">Setting up biometric authentication...</p>
          </>
        )

      case "authenticating":
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-2xl animate-pulse">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-fingerprint mr-2 text-blue-600"></i>
              Checking Biometric Setup
            </h3>
            <p className="text-sm text-gray-600">Looking for registered biometric credentials...</p>
          </>
        )

      case "biometric-prompt":
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-2xl animate-pulse">
              <i className="fas fa-fingerprint"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-hand-paper mr-2 text-blue-500"></i>
              Biometric Authentication
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              <strong>Please use your fingerprint, face, or device authentication now!</strong>
            </p>
            <div className="mt-2 space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:shadow-md">
              <p className="text-sm text-blue-700 flex items-center">
                <i className="fas fa-magic mr-2 text-blue-500"></i>
                <strong>Ready for authentication</strong>
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                <i className="fas fa-fingerprint mr-2 text-blue-400"></i>
                Touch your fingerprint sensor
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                <i className="fas fa-user-circle mr-2 text-blue-400"></i>
                Use face recognition if available
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                <i className="fas fa-keyboard mr-2 text-blue-400"></i>
                Enter device PIN if prompted
              </p>
            </div>
          </>
        )

      case "verifying":
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-2xl animate-spin">
              <i className="fas fa-sync-alt"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-shield-alt mr-2 text-blue-500"></i>
              Verifying Authentication
            </h3>
            <p className="text-sm text-gray-600">Processing your biometric data...</p>
          </>
        )

      case "success":
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-teal-100 text-green-600 text-2xl animate-bounce">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-check-circle mr-2 text-green-500"></i>
              Authentication Successful!
            </h3>
            <p className="text-sm text-gray-600">Logging you in...</p>
          </>
        )

      case "error":
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 text-red-600 text-2xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-times-circle mr-2 text-red-500"></i>
              Authentication Failed
            </h3>
            <p className="text-sm text-gray-600">Unable to authenticate with biometrics</p>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}
          </>
        )

      default:
        return (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-2xl">
              <i className="fas fa-fingerprint"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              <i className="fas fa-fingerprint mr-2 text-blue-500"></i>
              Biometric Authentication
            </h3>
            <p className="text-sm text-gray-600">Please use your biometric authentication</p>
          </>
        )
    }
  }

  return (
    <div className="biometric-login">
      <div className="rounded-2xl border border-gray-200/70 bg-white/95 p-6 text-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
        <div className="space-y-4">{renderContent()}</div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {step === "error" && (
            <button
              onClick={retryBiometric}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-70"
              disabled={loading}
            >
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
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 active:scale-95"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Password Login
          </button>
        </div>

        <div className="mt-6 text-left text-sm text-gray-600">
          <p className="font-medium flex items-center">
            <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
            <span>Instant Biometric Login:</span>
          </p>
          <ul className="ml-5 mt-2 space-y-1">
            <li className="flex items-center transition-colors duration-200 hover:text-gray-800">
              <i className="fas fa-check-circle mr-2 text-green-500 text-xs"></i>
              No username required
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-gray-800">
              <i className="fas fa-check-circle mr-2 text-green-500 text-xs"></i>
              Just use your biometric
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-gray-800">
              <i className="fas fa-check-circle mr-2 text-green-500 text-xs"></i>
              Automatic user identification
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-gray-800">
              <i className="fas fa-check-circle mr-2 text-green-500 text-xs"></i>
              Fastest login method
            </li>
          </ul>

          {step === "error" && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-800 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
              <p className="font-medium flex items-center">
                <i className="fas fa-tools mr-2 text-amber-600"></i>
                Troubleshooting:
              </p>
              <ul className="ml-5 mt-2 space-y-1">
                <li className="flex items-center">
                  <i className="fas fa-circle mr-2 text-amber-500 text-xs"></i>
                  Ensure biometric is setup in Settings
                </li>
                <li className="flex items-center">
                  <i className="fas fa-circle mr-2 text-amber-500 text-xs"></i>
                  Check device screen lock is enabled
                </li>
                <li className="flex items-center">
                  <i className="fas fa-circle mr-2 text-amber-500 text-xs"></i>
                  Try clearing browser cache
                </li>
                <li className="flex items-center">
                  <i className="fas fa-circle mr-2 text-amber-500 text-xs"></i>
                  Use password login as backup
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .biometric-login {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .shadow-card {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05), 0 2px 10px rgba(0, 0, 0, 0.02);
        }
        
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  )
}

export default BiometricLogin