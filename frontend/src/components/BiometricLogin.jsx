"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Fingerprint, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  ArrowLeft, 
  Zap, 
  Lock,
  ScanFace,
  Check,
  XCircle
} from "lucide-react"

const BiometricLogin = ({ onLogin, onCancel }) => {
  // ==========================================
  //  CORE LOGIC (UNCHANGED)
  // ==========================================
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [step, setStep] = useState("preparing")
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)

  useEffect(() => {
    console.log("🔐 BiometricLogin component mounted - starting immediate auth")
    
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

    if (!window.PublicKeyCredential) {
      console.log("❌ WebAuthn not supported")
      return { supported: false, reason: "WebAuthn API not available" }
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

      if (!available && appContext.isApplication) {
        console.log("🔄 Trying alternative biometric detection for application...")

        if (!window.isSecureContext) {
          if (appContext.isElectron) {
            console.log("✅ Electron context detected, proceeding...")
          } else {
            return { supported: false, reason: "Secure context required for biometric authentication" }
          }
        }

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
              timeout: 1000,
            },
          })
          return { supported: true, available: true }
        } catch (testError) {
          if (testError.name === "NotAllowedError" || testError.name === "AbortError") {
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
      } catch (e) {
        throw new Error("Invalid challenge format received from server")
      }

      if (options.allowCredentials && options.allowCredentials.length > 0) {
        options.allowCredentials = options.allowCredentials.map((cred) => {
          try {
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

            return {
              ...cred,
              id: credentialIdBytes,
            }
          } catch (e) {
            throw new Error(`Invalid credential ID format: ${e.message}`)
          }
        })
      } else {
        throw new Error("No credentials available for authentication")
      }

      const webAuthnOptions = {
        publicKey: {
          ...options,
          timeout: appContext.isApplication ? 120000 : 60000,
          userVerification: "preferred",
        },
      }

      if (appContext.isApplication) {
        if (appContext.isElectron && window.electronAPI) {
          try {
            await window.electronAPI.focusWindow()
          } catch (e) {
            console.log("Could not focus window:", e)
          }
        }
      }

      const credential = await navigator.credentials.get(webAuthnOptions)

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

      const verifyResponse = await axios.post("/api/auth/biometric/login/verify", verificationData)

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
    setError("")
    startImmediateBiometricAuth()
  }

  // ==========================================
  //  NEW MODERN "DARK TECH" UI
  // ==========================================
  const renderContent = () => {
    const appContext = detectApplicationContext()

    return (
      <AnimatePresence mode="wait">
        {step === "preparing" && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            {/* Animated Loader Circle */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full border border-cyan-500/30 bg-black/40 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-cyan-400" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t border-cyan-400"
                />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Initializing System</h3>
            <p className="text-sm text-gray-400 mb-6">Establishing secure connection...</p>

            {/* Tech Progress Bar */}
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              />
            </div>
            <div className="mt-2 text-xs font-mono text-cyan-500/70">{progress}% LOADED</div>
          </motion.div>
        )}

        {step === "authenticating" && (
          <motion.div
            key="authenticating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center py-6"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
              {/* Scanner Animation */}
              <div className="relative h-32 w-32 rounded-2xl border border-gray-700 bg-black/50 overflow-hidden flex items-center justify-center">
                <ScanFace className="h-16 w-16 text-gray-600" strokeWidth={1} />
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1">Scanning...</h3>
            <p className="text-sm text-gray-400 max-w-[240px] text-center">
              {appContext.isApplication ? "Verifying app credentials" : "Locating passkeys"}
            </p>
          </motion.div>
        )}

        {step === "biometric-prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center w-full"
          >
            <div className="relative mb-6">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl" 
              />
              <div className="relative h-28 w-28 rounded-full border border-violet-500/30 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center shadow-2xl">
                <Fingerprint className="h-14 w-14 text-violet-400" strokeWidth={1.5} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Identify Yourself</h3>
            <p className="text-sm text-gray-400 mb-8 text-center">Use your device's biometric sensor</p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-colors">
                <Fingerprint className="h-6 w-6 text-violet-400 mb-2" />
                <span className="text-xs text-gray-300 font-medium">Touch ID</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-colors">
                <ScanFace className="h-6 w-6 text-blue-400 mb-2" />
                <span className="text-xs text-gray-300 font-medium">Face ID</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-10"
          >
            <div className="relative h-20 w-20 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500"
              />
              <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                 <Lock className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white">Verifying Crypto Key</h3>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6"
          >
            <div className="relative mb-6">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl" 
              />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-900 to-green-800 flex items-center justify-center border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
                <Check className="h-12 w-12 text-white" strokeWidth={3} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1">Access Granted</h3>
            <p className="text-sm text-emerald-400/80 mb-6">Decryption successful</p>
            
            <motion.div 
              initial={{ width: 0 }} animate={{ width: "100%" }} 
              className="h-1 bg-emerald-500 rounded-full"
            />
          </motion.div>
        )}

        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center w-full"
          >
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-4">Authentication Failed</h3>

            <div className="w-full bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300 text-center leading-relaxed">
                {error || "Could not verify identity"}
              </p>
            </div>

            <div className="w-full space-y-2">
               <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-900/50 p-3 rounded border border-gray-800">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Check if screen lock is enabled</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // ==========================================
  //  MAIN RENDER (Dark Mode Container)
  // ==========================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-sans">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-900/20 blur-[120px]" />

      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-[400px] px-4"
      >
        {/* Glass Card */}
        <div className="w-full rounded-3xl bg-gray-950/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
              Biometric Vault v2.0
            </div>
          </div>

          {/* Dynamic Body */}
          <div className="p-8 min-h-[400px] flex flex-col justify-between">
            {renderContent()}

            {/* Footer Buttons */}
            <motion.div layout className="mt-6 flex flex-col gap-3">
              {step === "error" && (
                <button
                  onClick={retryBiometric}
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Try Again</span>
                </button>
              )}
              
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 font-medium hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Switch to Password</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Secure Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
           <Lock className="h-3 w-3" />
           <span className="text-xs font-medium tracking-wide">End-to-End Encrypted</span>
        </div>

      </motion.div>
    </div>
  )
}

export default BiometricLogin