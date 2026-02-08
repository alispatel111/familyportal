"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const BiometricLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [step, setStep] = useState("preparing")
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)

  useEffect(() => {
    console.log("🔐 BiometricLogin component mounted - starting immediate auth")
    
    // Animated progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 20)

    setTimeout(() => {
      startImmediateBiometricAuth()
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const detectApplicationContext = () => {
    const isElectron = typeof window !== "undefined" && window.process && window.process.type
    const isCordova = typeof window !== "undefined" && window.cordova
    const isCapacitor = typeof window !== "undefined" && window.Capacitor
    const isWebView =
      typeof window !== "undefined" &&
      (window.navigator.userAgent.includes("wv") ||
        window.navigator.userAgent.includes("WebView") ||
        window.navigator.standalone === true)

    return {
      isElectron: !!isElectron,
      isCordova: !!isCordova,
      isCapacitor: !!isCapacitor,
      isWebView: !!isWebView,
      isApplication: !!(isElectron || isCordova || isCapacitor || isWebView),
      context: isElectron
        ? "electron"
        : isCordova
          ? "cordova"
          : isCapacitor
            ? "capacitor"
            : isWebView
              ? "webview"
              : "web",
    }
  }

  const checkWebAuthnSupport = async () => {
    const appContext = detectApplicationContext()
    console.log("🔍 Application context:", appContext)

    // Basic WebAuthn support
    if (!window.PublicKeyCredential) {
      console.log("❌ WebAuthn not supported")
      return { supported: false, reason: "WebAuthn API not available" }
    }

    try {
      // Check if user verifying platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

      if (!available && appContext.isApplication) {
        // For applications, try alternative detection methods
        console.log("🔄 Trying alternative biometric detection for application...")

        // Check if we're in a secure context (required for WebAuthn)
        if (!window.isSecureContext) {
          console.log("⚠️ Not in secure context, trying to enable...")
          // For applications, we might need to handle this differently
          if (appContext.isElectron) {
            // Electron apps can work with localhost
            console.log("✅ Electron context detected, proceeding...")
          } else {
            return { supported: false, reason: "Secure context required for biometric authentication" }
          }
        }

        // Try to create a test credential to verify support
        try {
          const testSupport = await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: "Test" },
              user: { id: new Uint8Array(16), name: "test", displayName: "Test" },
              pubKeyCredParams: [{ alg: -7, type: "public-key" }],
              authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
              },
              timeout: 1000, // Short timeout for test
            },
          })
          return { supported: true, available: true }
        } catch (testError) {
          console.log("🔍 Test credential creation failed:", testError.name)
          if (testError.name === "NotAllowedError" || testError.name === "AbortError") {
            // This actually means biometric is available but user cancelled/timeout
            return { supported: true, available: true }
          }
        }
      }

      return { supported: true, available }
    } catch (error) {
      console.log("❌ WebAuthn support check failed:", error)
      return { supported: false, reason: error.message }
    }
  }

  const startImmediateBiometricAuth = async () => {
    console.log("🚀 Starting immediate biometric authentication...")
    setLoading(true)
    setError("")
    setStep("authenticating")

    try {
      const supportCheck = await checkWebAuthnSupport()
      if (!supportCheck.supported) {
        throw new Error(`Biometric authentication not supported: ${supportCheck.reason}`)
      }

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
        setError(error.response?.data?.message || error.message || "Biometric authentication failed. Please try again.")
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

      const appContext = detectApplicationContext()

      const challengeString = options.challenge
      if (!challengeString) {
        throw new Error("No challenge received from server")
      }

      try {
        let challengeBytes
        if (typeof challengeString === "string") {
          // Handle both base64 and base64url encoding
          const normalizedChallenge = challengeString.replace(/-/g, "+").replace(/_/g, "/")
          const paddedChallenge = normalizedChallenge.padEnd(
            normalizedChallenge.length + ((4 - (normalizedChallenge.length % 4)) % 4),
            "=",
          )
          challengeBytes = Uint8Array.from(atob(paddedChallenge), (c) => c.charCodeAt(0))
        } else if (challengeString instanceof ArrayBuffer || Array.isArray(challengeString)) {
          challengeBytes = new Uint8Array(challengeString)
        } else {
          throw new Error("Invalid challenge format")
        }

        options.challenge = challengeBytes
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
              const normalizedCredId = cred.id.replace(/-/g, "+").replace(/_/g, "/")
              const paddedCredId = normalizedCredId.padEnd(
                normalizedCredId.length + ((4 - (normalizedCredId.length % 4)) % 4),
                "=",
              )
              credentialIdBytes = Uint8Array.from(atob(paddedCredId), (c) => c.charCodeAt(0))
            } else if (Array.isArray(cred.id)) {
              credentialIdBytes = new Uint8Array(cred.id)
            } else if (cred.id instanceof ArrayBuffer) {
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

      const webAuthnOptions = {
        publicKey: {
          ...options,
          timeout: appContext.isApplication ? 120000 : 60000, // Longer timeout for apps
          userVerification: "preferred", // More flexible for applications
        },
      }

      if (appContext.isApplication) {
        console.log(`🔧 Applying ${appContext.context} specific optimizations...`)

        // For Electron apps, ensure proper window focus
        if (appContext.isElectron && window.electronAPI) {
          try {
            await window.electronAPI.focusWindow()
          } catch (e) {
            console.log("Could not focus window:", e)
          }
        }

        // For Cordova/PhoneGap apps
        if (appContext.isCordova && window.device) {
          console.log("📱 Cordova device detected:", window.device.platform)
        }

        // For Capacitor apps
        if (appContext.isCapacitor && window.Capacitor) {
          console.log("📱 Capacitor platform:", window.Capacitor.getPlatform())
        }
      }

      console.log("🔐 Starting WebAuthn credential.get()...")

      const credential = await navigator.credentials.get(webAuthnOptions)

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
        applicationContext: appContext,
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
        const appContext = detectApplicationContext()
        if (appContext.isApplication) {
          errorMessage = "Security error: Please ensure your app has proper permissions for biometric access"
        } else {
          errorMessage = "Security error: Please ensure you're using HTTPS"
        }
      } else if (error.name === "NetworkError") {
        errorMessage = "Network error during authentication. Please check your connection."
      } else if (error.name === "InvalidCharacterError" || error.message.includes("Invalid credential ID format")) {
        errorMessage = "Invalid credential data. Please try password login or re-setup biometric authentication."
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Biometric authentication is not supported in this application context"
      } else if (error.name === "AbortError") {
        errorMessage = "Authentication timed out. Please try again."
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
    const appContext = detectApplicationContext()

    switch (step) {
      case "preparing":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-50 shadow-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-3xl text-blue-500"
                >
                  ⚡
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Initializing Secure Login
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Setting up biometric authentication...
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Initializing...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )

      case "authenticating":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-ping" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl text-blue-600"
                >
                  🔍
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Checking Biometrics
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {appContext.isApplication
                  ? "Verifying app biometric capabilities..."
                  : "Looking for registered biometric credentials..."}
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-blue-500"
                />
              ))}
            </div>
          </motion.div>
        )

      case "biometric-prompt":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-28 w-28">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300/50"
              />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 shadow-2xl">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  👆
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 text-center">
                Biometric Required
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Please use your fingerprint, face, or device authentication
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 backdrop-blur-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg">👆</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Touch fingerprint sensor</p>
                    <p className="text-sm text-gray-600">Place your registered finger</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Face recognition</p>
                    <p className="text-sm text-gray-600">Look at your camera</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <span className="text-lg">🔢</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Device PIN</p>
                    <p className="text-sm text-gray-600">Enter your device PIN if prompted</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )

      case "verifying":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-24 w-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20"
              />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-blue-50 shadow-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-3xl text-green-600"
                >
                  🔄
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Verifying Authentication
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Processing your biometric data securely...
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin" />
              </div>
            </div>
          </motion.div>
        )

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-28 w-28">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30"
              />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-5xl"
                >
                  ✅
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900 text-center">
                Authentication Successful!
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Welcome back! Logging you in...
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <span className="text-lg">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Login Complete</p>
                  <p className="text-sm text-green-600">Redirecting to your dashboard...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-24 w-24">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-orange-400/20"
              />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 shadow-2xl">
                <div className="text-4xl">⚠️</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Authentication Failed
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Unable to authenticate with biometrics
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50/80 to-white p-4 backdrop-blur-sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                    <span className="text-sm">!</span>
                  </div>
                  <p className="flex-1 text-sm text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-amber-800">Troubleshooting</h4>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Ensure biometric is setup in device settings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Check device screen lock is enabled</span>
                </li>
                {appContext.isApplication ? (
                  <li className="flex items-center space-x-2">
                    <span>•</span>
                    <span>Grant biometric permissions to the app</span>
                  </li>
                ) : (
                  <li className="flex items-center space-x-2">
                    <span>•</span>
                    <span>Ensure HTTPS connection is secure</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100" />
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Biometric Authentication
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Please use your biometric authentication
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-900"
          >
            Secure Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-gray-600"
          >
            Instant biometric authentication
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50" />
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-400/10 blur-3xl" />
          
          {/* Content */}
          <div className="relative p-8">
            {renderContent()}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col space-y-3"
            >
              {step === "error" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={retryBiometric}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-70 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Retrying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔄</span>
                      <span>Try Again</span>
                    </div>
                  )}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="w-full rounded-xl border-2 border-gray-300 bg-white py-3.5 text-gray-700 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>←</span>
                  <span>Back to Password Login</span>
                </div>
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 pt-8 border-t border-gray-100"
            >
              <h4 className="mb-4 text-center text-sm font-semibold text-gray-600">
                Why Biometric Login?
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "⚡", text: "Instant login" },
                  { icon: "🔒", text: "More secure" },
                  { icon: "👤", text: "No username" },
                  { icon: "📱", text: "Device optimized" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex flex-col items-center space-y-1 rounded-xl bg-gradient-to-br from-gray-50 to-white p-3"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <p>Secure authentication powered by WebAuthn</p>
          <p className="mt-1">Ensure your device supports biometric authentication</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default BiometricLogin