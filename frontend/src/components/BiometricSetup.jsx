"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BiometricSetup = ({ user, onUpdate }) => {
  const [biometricStatus, setBiometricStatus] = useState({ supported: false, enabled: false, available: false })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    checkBiometricSupport()
    checkBiometricStatus()
  }, [])

  const checkBiometricSupport = () => {
    const supported = !!(navigator.credentials && navigator.credentials.create)
    if (supported && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setBiometricStatus((prev) => ({ ...prev, supported, available })))
        .catch(() => setBiometricStatus((prev) => ({ ...prev, supported, available: false })))
    } else {
      setBiometricStatus((prev) => ({ ...prev, supported: false, available: false }))
    }
  }

  const checkBiometricStatus = async () => {
    try {
      const response = await axios.get("/api/auth/biometric/status")
      setBiometricStatus((prev) => ({ ...prev, enabled: response.data.biometricEnabled }))
    } catch (error) {
      if (error.response?.status === 401) setError("Please login again to access biometric settings")
    }
  }

  const registerBiometric = async () => {
    setLoading(true)
    setError("")
    setMessage("")
    try {
      const optionsResponse = await axios.post("/api/auth/biometric/register")
      const { publicKeyCredentialCreationOptions } = optionsResponse.data
      const challengeString = publicKeyCredentialCreationOptions.challenge
      if (!challengeString) throw new Error("No challenge received from server")

      publicKeyCredentialCreationOptions.challenge = Uint8Array.from(atob(challengeString), (c) => c.charCodeAt(0))

      const userIdString = publicKeyCredentialCreationOptions.user.id
      if (!userIdString) throw new Error("No user ID received from server")
      publicKeyCredentialCreationOptions.user.id = Uint8Array.from(atob(userIdString), (c) => c.charCodeAt(0))

      const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions })
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
      if (error.name === "NotAllowedError") setError("Biometric registration was cancelled or not allowed")
      else if (error.name === "NotSupportedError") setError("Biometric authentication is not supported on this device")
      else if (error.name === "SecurityError") setError("Security error during biometric registration")
      else if (error.name === "InvalidCharacterError")
        setError("Invalid data format received from server. Please try again.")
      else if (error.response?.status === 401) setError("Authentication failed. Please login again.")
      else setError(error.message || error.response?.data?.message || "Failed to register biometric authentication")
    } finally {
      setLoading(false)
    }
  }

  const disableBiometric = async () => {
    if (!window.confirm("Are you sure you want to disable biometric authentication?")) return
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🔐</span> Biometric Authentication
        </h3>
        <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Biometric authentication is not supported on this browser or device.</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          To use biometric authentication, please use a modern browser on a device with fingerprint sensor, face
          recognition, or other biometric capabilities.
        </p>
      </div>
    )
  }

  if (!biometricStatus.available) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🔐</span> Biometric Authentication
        </h3>
        <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">No biometric authenticator available on this device.</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          Please ensure your device has fingerprint, face recognition, or PIN authentication enabled in your system
          settings.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
        <span className="text-xl">🔐</span> Biometric Authentication
      </h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Secure your account with fingerprint, face recognition, or other biometric authentication methods.
      </p>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 text-sm text-green-800 transition-all duration-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="text-sm font-medium text-gray-600 mb-1">Browser Support:</div>
          <div className={`text-sm font-semibold ${biometricStatus.supported ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
            {biometricStatus.supported ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Supported
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Not Supported
              </>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="text-sm font-medium text-gray-600 mb-1">Device Capability:</div>
          <div className={`text-sm font-semibold ${biometricStatus.available ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
            {biometricStatus.available ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Available
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Not Available
              </>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="text-sm font-medium text-gray-600 mb-1">Current Status:</div>
          <div className={`text-sm font-semibold ${biometricStatus.enabled ? 'text-green-600' : 'text-amber-600'} flex items-center gap-1`}>
            {biometricStatus.enabled ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Enabled
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Disabled
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {!biometricStatus.enabled ? (
          <button
            onClick={registerBiometric}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.03] disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Enable Biometric Login
              </>
            )}
          </button>
        ) : (
          <button
            onClick={disableBiometric}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:scale-[1.03] disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Disabling...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Disable Biometric Login
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 transition-all duration-300 hover:shadow-md">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            Supported Methods
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-blue-500">👆</span> Fingerprint authentication
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-blue-500">👤</span> Face recognition
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-blue-500">🔢</span> Device PIN/Password
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-blue-500">🔑</span> Hardware security keys
            </li>
          </ul>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 transition-all duration-300 hover:shadow-md">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Security Benefits
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-green-500">🚀</span> Faster login process
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-green-500">🔒</span> Enhanced security
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-green-500">🚫</span> No password required
            </li>
            <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <span className="text-green-500">📱</span> Device-specific authentication
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 transition-all duration-300 hover:shadow-md">
        <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Enable Biometric Authentication
        </h4>
        <ol className="space-y-3 text-sm text-gray-600 ml-2">
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Click "Enable Biometric Login" button</span>
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Follow your device's biometric prompt (fingerprint/face/PIN)</span>
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>Confirm the authentication</span>
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span>Biometric login is now active!</span>
          </li>
        </ol>

        <h4 className="mt-6 mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Troubleshooting
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 ml-2">
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="text-amber-500">•</span> Make sure you're logged in properly
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="text-amber-500">•</span> Enable device lock screen (PIN/Pattern/Password)
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="text-amber-500">•</span> Add fingerprint/face in device settings
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="text-amber-500">•</span> Use HTTPS (secure connection)
          </li>
          <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
            <span className="text-amber-500">•</span> Try refreshing the page if it fails
          </li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default BiometricSetup