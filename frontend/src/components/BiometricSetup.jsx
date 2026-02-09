// "use client"

// import { useState, useEffect } from "react"
// import axios from "axios"

// const BiometricSetup = ({ user, onUpdate }) => {
//   const [biometricStatus, setBiometricStatus] = useState({ supported: false, enabled: false, available: false })
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState("")
//   const [error, setError] = useState("")

//   useEffect(() => {
//     checkBiometricSupport()
//     checkBiometricStatus()
//   }, [])

//   const detectApplicationContext = () => {
//     const isElectron = typeof window !== "undefined" && window.process && window.process.type
//     const isCordova = typeof window !== "undefined" && window.cordova
//     const isCapacitor = typeof window !== "undefined" && window.Capacitor
//     const isWebView =
//       typeof window !== "undefined" &&
//       (window.navigator.userAgent.includes("wv") ||
//         window.navigator.userAgent.includes("WebView") ||
//         window.navigator.standalone === true)

//     return {
//       isElectron: !!isElectron,
//       isCordova: !!isCordova,
//       isCapacitor: !!isCapacitor,
//       isWebView: !!isWebView,
//       isApplication: !!(isElectron || isCordova || isCapacitor || isWebView),
//       context: isElectron
//         ? "electron"
//         : isCordova
//           ? "cordova"
//           : isCapacitor
//             ? "capacitor"
//             : isWebView
//               ? "webview"
//               : "web",
//     }
//   }

//   const checkBiometricSupport = async () => {
//     const appContext = detectApplicationContext()
//     console.log("🔍 Checking biometric support in context:", appContext.context)

//     const supported = !!(navigator.credentials && navigator.credentials.create)

//     if (supported && window.PublicKeyCredential) {
//       try {
//         const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

//         if (!available && appContext.isApplication) {
//           console.log("🔄 Application context detected, performing enhanced checks...")

//           // For applications, try additional checks
//           try {
//             // Test if we can at least attempt to create credentials
//             const testOptions = {
//               publicKey: {
//                 challenge: new Uint8Array(32),
//                 rp: { name: "Test App" },
//                 user: {
//                   id: new Uint8Array(16),
//                   name: "test@example.com",
//                   displayName: "Test User",
//                 },
//                 pubKeyCredParams: [{ alg: -7, type: "public-key" }],
//                 authenticatorSelection: {
//                   authenticatorAttachment: "platform",
//                   userVerification: "preferred", // More lenient for apps
//                 },
//                 timeout: 5000,
//               },
//             }

//             // Don't actually create, just test if the API responds
//             navigator.credentials.create(testOptions).catch(() => {
//               // Expected to fail, we just want to see if API is accessible
//             })

//             setBiometricStatus((prev) => ({ ...prev, supported: true, available: true }))
//             return
//           } catch (testError) {
//             console.log("Enhanced check result:", testError.name)
//             // Even if test fails, mark as available for applications
//             setBiometricStatus((prev) => ({ ...prev, supported: true, available: true }))
//             return
//           }
//         }

//         setBiometricStatus((prev) => ({ ...prev, supported, available }))
//       } catch (error) {
//         console.log("Availability check failed:", error)
//         // For applications, be more permissive
//         setBiometricStatus((prev) => ({
//           ...prev,
//           supported,
//           available: appContext.isApplication ? true : false,
//         }))
//       }
//     } else {
//       setBiometricStatus((prev) => ({ ...prev, supported: false, available: false }))
//     }
//   }

//   const checkBiometricStatus = async () => {
//     try {
//       const response = await axios.get("/api/auth/biometric/status")
//       setBiometricStatus((prev) => ({ ...prev, enabled: response.data.biometricEnabled }))
//     } catch (error) {
//       if (error.response?.status === 401) setError("Please login again to access biometric settings")
//     }
//   }

//   const registerBiometric = async () => {
//     setLoading(true)
//     setError("")
//     setMessage("")

//     try {
//       const appContext = detectApplicationContext()
//       console.log("🔐 Starting biometric registration in context:", appContext.context)

//       const optionsResponse = await axios.post("/api/auth/biometric/register")
//       const { publicKeyCredentialCreationOptions } = optionsResponse.data

//       const challengeString = publicKeyCredentialCreationOptions.challenge
//       if (!challengeString) throw new Error("No challenge received from server")

//       try {
//         let challengeBytes
//         if (typeof challengeString === "string") {
//           const normalizedChallenge = challengeString.replace(/-/g, "+").replace(/_/g, "/")
//           const paddedChallenge = normalizedChallenge.padEnd(
//             normalizedChallenge.length + ((4 - (normalizedChallenge.length % 4)) % 4),
//             "=",
//           )
//           challengeBytes = Uint8Array.from(atob(paddedChallenge), (c) => c.charCodeAt(0))
//         } else {
//           challengeBytes = new Uint8Array(challengeString)
//         }
//         publicKeyCredentialCreationOptions.challenge = challengeBytes
//       } catch (e) {
//         throw new Error("Invalid challenge format received from server")
//       }

//       const userIdString = publicKeyCredentialCreationOptions.user.id
//       if (!userIdString) throw new Error("No user ID received from server")

//       try {
//         let userIdBytes
//         if (typeof userIdString === "string") {
//           const normalizedUserId = userIdString.replace(/-/g, "+").replace(/_/g, "/")
//           const paddedUserId = normalizedUserId.padEnd(
//             normalizedUserId.length + ((4 - (normalizedUserId.length % 4)) % 4),
//             "=",
//           )
//           userIdBytes = Uint8Array.from(atob(paddedUserId), (c) => c.charCodeAt(0))
//         } else {
//           userIdBytes = new Uint8Array(userIdString)
//         }
//         publicKeyCredentialCreationOptions.user.id = userIdBytes
//       } catch (e) {
//         throw new Error("Invalid user ID format received from server")
//       }

//       if (appContext.isApplication) {
//         // Longer timeout for applications
//         publicKeyCredentialCreationOptions.timeout = 120000

//         // More flexible authenticator selection for apps
//         if (publicKeyCredentialCreationOptions.authenticatorSelection) {
//           publicKeyCredentialCreationOptions.authenticatorSelection.userVerification = "preferred"
//         }

//         // For Electron apps, try to focus window
//         if (appContext.isElectron && window.electronAPI) {
//           try {
//             await window.electronAPI.focusWindow()
//           } catch (e) {
//             console.log("Could not focus window:", e)
//           }
//         }
//       }

//       console.log("🔐 Creating WebAuthn credential...")
//       const credential = await navigator.credentials.create({
//         publicKey: publicKeyCredentialCreationOptions,
//       })

//       const verificationData = {
//         credential: {
//           id: credential.id,
//           rawId: Array.from(new Uint8Array(credential.rawId)),
//           response: {
//             attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
//             clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
//             publicKey: credential.response.publicKey ? Array.from(new Uint8Array(credential.response.publicKey)) : null,
//           },
//           type: credential.type,
//         },
//         applicationContext: appContext,
//       }

//       const verifyResponse = await axios.post("/api/auth/biometric/register/verify", verificationData)

//       if (verifyResponse.data.verified) {
//         setMessage(
//           `🎉 Biometric authentication enabled successfully${appContext.isApplication ? ` for ${appContext.context} app` : ""}!`,
//         )
//         setBiometricStatus((prev) => ({ ...prev, enabled: true }))
//         if (onUpdate) onUpdate()
//       }
//     } catch (error) {
//       console.error("Biometric registration failed:", error)

//       let errorMessage = "Failed to register biometric authentication"

//       if (error.name === "NotAllowedError") {
//         errorMessage = "Biometric registration was cancelled or not allowed"
//       } else if (error.name === "NotSupportedError") {
//         const appContext = detectApplicationContext()
//         if (appContext.isApplication) {
//           errorMessage = `Biometric authentication is not supported in this ${appContext.context} app context`
//         } else {
//           errorMessage = "Biometric authentication is not supported on this device"
//         }
//       } else if (error.name === "SecurityError") {
//         const appContext = detectApplicationContext()
//         if (appContext.isApplication) {
//           errorMessage = "Security error: Please ensure your app has proper biometric permissions"
//         } else {
//           errorMessage = "Security error: Please ensure you're using HTTPS"
//         }
//       } else if (error.name === "InvalidCharacterError") {
//         errorMessage = "Invalid data format received from server. Please try again."
//       } else if (error.name === "AbortError") {
//         errorMessage = "Registration timed out. Please try again."
//       } else if (error.response?.status === 401) {
//         errorMessage = "Authentication failed. Please login again."
//       } else if (error.message) {
//         errorMessage = error.message
//       } else if (error.response?.data?.message) {
//         errorMessage = error.response.data.message
//       }

//       setError(errorMessage)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const disableBiometric = async () => {
//     if (!window.confirm("Are you sure you want to disable biometric authentication?")) return
//     setLoading(true)
//     setError("")
//     setMessage("")
//     try {
//       await axios.post("/api/auth/biometric/disable")
//       setMessage("Biometric authentication disabled successfully")
//       setBiometricStatus((prev) => ({ ...prev, enabled: false }))
//       if (onUpdate) onUpdate()
//     } catch (error) {
//       setError(error.response?.data?.message || "Failed to disable biometric authentication")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const appContext = detectApplicationContext()

//   if (!biometricStatus.supported) {
//     return (
//       <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//           <span className="text-xl">🔐</span> Biometric Authentication
//         </h3>
//         <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 hover:scale-[1.01]">
//           <div className="flex items-center gap-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span className="font-medium">
//               Biometric authentication is not supported on this{" "}
//               {appContext.isApplication ? `${appContext.context} app` : "browser or device"}.
//             </span>
//           </div>
//         </div>
//         <p className="mt-4 text-sm text-gray-600 leading-relaxed">
//           {appContext.isApplication
//             ? `To use biometric authentication in this ${appContext.context} app, please ensure your device has biometric capabilities and the app has proper permissions.`
//             : "To use biometric authentication, please use a modern browser on a device with fingerprint sensor, face recognition, or other biometric capabilities."}
//         </p>
//       </div>
//     )
//   }

//   if (!biometricStatus.available) {
//     return (
//       <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//           <span className="text-xl">🔐</span> Biometric Authentication
//         </h3>
//         <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 hover:scale-[1.01]">
//           <div className="flex items-center gap-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span className="font-medium">No biometric authenticator available on this device.</span>
//           </div>
//         </div>
//         <p className="mt-4 text-sm text-gray-600 leading-relaxed">
//           {appContext.isApplication
//             ? `Please ensure your device has fingerprint, face recognition, or PIN authentication enabled and that this ${appContext.context} app has the necessary permissions.`
//             : "Please ensure your device has fingerprint, face recognition, or PIN authentication enabled in your system settings."}
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-lg">
//       <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
//         <span className="text-xl">🔐</span> Biometric Authentication
//         {appContext.isApplication && (
//           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{appContext.context} app</span>
//         )}
//       </h3>
//       <p className="text-sm text-gray-600 mb-6 leading-relaxed">
//         Secure your account with fingerprint, face recognition, or other biometric authentication methods
//         {appContext.isApplication ? ` in this ${appContext.context} application` : ""}.
//       </p>

//       {/* ... existing message and error display code ... */}
//       {message && (
//         <div className="mb-6 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 text-sm text-green-800 transition-all duration-300 animate-fadeIn">
//           <div className="flex items-center gap-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>{message}</span>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700 transition-all duration-300 animate-fadeIn">
//           <div className="flex items-center gap-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       {/* ... existing status grid code ... */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
//           <div className="text-sm font-medium text-gray-600 mb-1">
//             {appContext.isApplication ? `${appContext.context} Support:` : "Browser Support:"}
//           </div>
//           <div
//             className={`text-sm font-semibold ${biometricStatus.supported ? "text-green-600" : "text-red-600"} flex items-center gap-1`}
//           >
//             {biometricStatus.supported ? (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Supported
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Not Supported
//               </>
//             )}
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
//           <div className="text-sm font-medium text-gray-600 mb-1">Device Capability:</div>
//           <div
//             className={`text-sm font-semibold ${biometricStatus.available ? "text-green-600" : "text-red-600"} flex items-center gap-1`}
//           >
//             {biometricStatus.available ? (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Available
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Not Available
//               </>
//             )}
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
//           <div className="text-sm font-medium text-gray-600 mb-1">Current Status:</div>
//           <div
//             className={`text-sm font-semibold ${biometricStatus.enabled ? "text-green-600" : "text-amber-600"} flex items-center gap-1`}
//           >
//             {biometricStatus.enabled ? (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Enabled
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                   <path
//                     fillRule="evenodd"
//                     d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Disabled
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ... existing button code ... */}
//       <div className="flex flex-wrap items-center gap-3 mb-8">
//         {!biometricStatus.enabled ? (
//           <button
//             onClick={registerBiometric}
//             disabled={loading}
//             className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.03] disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-md"
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin h-4 w-4 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Setting up...
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path
//                     fillRule="evenodd"
//                     d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Enable Biometric Login
//               </>
//             )}
//           </button>
//         ) : (
//           <button
//             onClick={disableBiometric}
//             disabled={loading}
//             className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:scale-[1.03] disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-md"
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin h-4 w-4 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Disabling...
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                   <path
//                     fillRule="evenodd"
//                     d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Disable Biometric Login
//               </>
//             )}
//           </button>
//         )}
//       </div>

//       {/* ... existing info sections with enhanced application-specific content ... */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 transition-all duration-300 hover:shadow-md">
//           <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 text-blue-500"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Supported Methods
//           </h4>
//           <ul className="space-y-2 text-sm text-gray-600">
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-blue-500">👆</span> Fingerprint authentication
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-blue-500">👤</span> Face recognition
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-blue-500">🔢</span> Device PIN/Password
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-blue-500">🔑</span> Hardware security keys
//             </li>
//             {appContext.isApplication && (
//               <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-blue-500">📱</span> App-optimized authentication
//               </li>
//             )}
//           </ul>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 transition-all duration-300 hover:shadow-md">
//           <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 text-green-500"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Security Benefits
//           </h4>
//           <ul className="space-y-2 text-sm text-gray-600">
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-green-500">🚀</span> Faster login process
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-green-500">🔒</span> Enhanced security
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-green-500">🚫</span> No password required
//             </li>
//             <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//               <span className="text-green-500">📱</span> Device-specific authentication
//             </li>
//             {appContext.isApplication && (
//               <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-green-500">⚡</span> Optimized for applications
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>

//       <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 transition-all duration-300 hover:shadow-md">
//         <h4 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-purple-500"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           How to Enable Biometric Authentication
//         </h4>
//         <ol className="space-y-3 text-sm text-gray-600 ml-2">
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
//               1
//             </span>
//             <span>Click "Enable Biometric Login" button</span>
//           </li>
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
//               2
//             </span>
//             <span>Follow your device's biometric prompt (fingerprint/face/PIN)</span>
//           </li>
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
//               3
//             </span>
//             <span>Confirm the authentication</span>
//           </li>
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
//               4
//             </span>
//             <span>
//               Biometric login is now active{appContext.isApplication ? ` in your ${appContext.context} app` : ""}!
//             </span>
//           </li>
//         </ol>

//         <h4 className="mt-6 mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-amber-500"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path
//               fillRule="evenodd"
//               d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//               clipRule="evenodd"
//             />
//           </svg>
//           Troubleshooting
//         </h4>
//         <ul className="space-y-2 text-sm text-gray-600 ml-2">
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="text-amber-500">•</span> Make sure you're logged in properly
//           </li>
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="text-amber-500">•</span> Enable device lock screen (PIN/Pattern/Password)
//           </li>
//           <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//             <span className="text-amber-500">•</span> Add fingerprint/face in device settings
//           </li>
//           {appContext.isApplication ? (
//             <>
//               <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-amber-500">•</span> Grant biometric permissions to the app
//               </li>
//               <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-amber-500">•</span> Restart the app if authentication fails
//               </li>
//               <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-amber-500">•</span> Check app has proper security permissions
//               </li>
//             </>
//           ) : (
//             <>
//               <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-amber-500">•</span> Use HTTPS (secure connection)
//               </li>
//               <li className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1">
//                 <span className="text-amber-500">•</span> Try refreshing the page if it fails
//               </li>
//             </>
//           )}
//         </ul>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default BiometricSetup





"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Loader2, 
  ShieldAlert,
  Globe,
  MonitorSmartphone,
  Info
} from "lucide-react"

const BiometricSetup = ({ user, onUpdate }) => {
  // ==========================================
  // LOGIC SECTION (UNCHANGED)
  // ==========================================
  const [biometricStatus, setBiometricStatus] = useState({ supported: false, enabled: false, available: false })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkBiometricSupport()
    checkBiometricStatus()
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

  const checkBiometricSupport = async () => {
    const appContext = detectApplicationContext()
    console.log("🔍 Checking biometric support in context:", appContext.context)

    const supported = !!(navigator.credentials && navigator.credentials.create)

    if (supported && window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

        if (!available && appContext.isApplication) {
          console.log("🔄 Application context detected, performing enhanced checks...")

          try {
            const testOptions = {
              publicKey: {
                challenge: new Uint8Array(32),
                rp: { name: "Test App" },
                user: {
                  id: new Uint8Array(16),
                  name: "test@example.com",
                  displayName: "Test User",
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: {
                  authenticatorAttachment: "platform",
                  userVerification: "preferred",
                },
                timeout: 5000,
              },
            }

            navigator.credentials.create(testOptions).catch(() => {})
            setBiometricStatus((prev) => ({ ...prev, supported: true, available: true }))
            return
          } catch (testError) {
            console.log("Enhanced check result:", testError.name)
            setBiometricStatus((prev) => ({ ...prev, supported: true, available: true }))
            return
          }
        }

        setBiometricStatus((prev) => ({ ...prev, supported, available }))
      } catch (error) {
        console.log("Availability check failed:", error)
        setBiometricStatus((prev) => ({
          ...prev,
          supported,
          available: appContext.isApplication ? true : false,
        }))
      }
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
      const appContext = detectApplicationContext()
      console.log("🔐 Starting biometric registration in context:", appContext.context)

      const optionsResponse = await axios.post("/api/auth/biometric/register")
      const { publicKeyCredentialCreationOptions } = optionsResponse.data

      const challengeString = publicKeyCredentialCreationOptions.challenge
      if (!challengeString) throw new Error("No challenge received from server")

      try {
        let challengeBytes
        if (typeof challengeString === "string") {
          const normalizedChallenge = challengeString.replace(/-/g, "+").replace(/_/g, "/")
          const paddedChallenge = normalizedChallenge.padEnd(
            normalizedChallenge.length + ((4 - (normalizedChallenge.length % 4)) % 4),
            "=",
          )
          challengeBytes = Uint8Array.from(atob(paddedChallenge), (c) => c.charCodeAt(0))
        } else {
          challengeBytes = new Uint8Array(challengeString)
        }
        publicKeyCredentialCreationOptions.challenge = challengeBytes
      } catch (e) {
        throw new Error("Invalid challenge format received from server")
      }

      const userIdString = publicKeyCredentialCreationOptions.user.id
      if (!userIdString) throw new Error("No user ID received from server")

      try {
        let userIdBytes
        if (typeof userIdString === "string") {
          const normalizedUserId = userIdString.replace(/-/g, "+").replace(/_/g, "/")
          const paddedUserId = normalizedUserId.padEnd(
            normalizedUserId.length + ((4 - (normalizedUserId.length % 4)) % 4),
            "=",
          )
          userIdBytes = Uint8Array.from(atob(paddedUserId), (c) => c.charCodeAt(0))
        } else {
          userIdBytes = new Uint8Array(userIdString)
        }
        publicKeyCredentialCreationOptions.user.id = userIdBytes
      } catch (e) {
        throw new Error("Invalid user ID format received from server")
      }

      if (appContext.isApplication) {
        publicKeyCredentialCreationOptions.timeout = 120000

        if (publicKeyCredentialCreationOptions.authenticatorSelection) {
          publicKeyCredentialCreationOptions.authenticatorSelection.userVerification = "preferred"
        }

        if (appContext.isElectron && window.electronAPI) {
          try {
            await window.electronAPI.focusWindow()
          } catch (e) {
            console.log("Could not focus window:", e)
          }
        }
      }

      console.log("🔐 Creating WebAuthn credential...")
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })

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
        applicationContext: appContext,
      }

      const verifyResponse = await axios.post("/api/auth/biometric/register/verify", verificationData)

      if (verifyResponse.data.verified) {
        setMessage(
          `Biometric authentication enabled successfully${appContext.isApplication ? ` for ${appContext.context} app` : ""}!`,
        )
        setBiometricStatus((prev) => ({ ...prev, enabled: true }))
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Biometric registration failed:", error)

      let errorMessage = "Failed to register biometric authentication"

      if (error.name === "NotAllowedError") {
        errorMessage = "Biometric registration was cancelled or not allowed"
      } else if (error.name === "NotSupportedError") {
        const appContext = detectApplicationContext()
        if (appContext.isApplication) {
          errorMessage = `Biometric authentication is not supported in this ${appContext.context} app context`
        } else {
          errorMessage = "Biometric authentication is not supported on this device"
        }
      } else if (error.name === "SecurityError") {
        const appContext = detectApplicationContext()
        if (appContext.isApplication) {
          errorMessage = "Security error: Please ensure your app has proper biometric permissions"
        } else {
          errorMessage = "Security error: Please ensure you're using HTTPS"
        }
      } else if (error.name === "InvalidCharacterError") {
        errorMessage = "Invalid data format received from server. Please try again."
      } else if (error.name === "AbortError") {
        errorMessage = "Registration timed out. Please try again."
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again."
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setError(errorMessage)
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

  const appContext = detectApplicationContext()

  // ==========================================
  // MODERNIZED UI SECTION
  // ==========================================

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  const cardVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  }

  // --- STATE 1: NOT SUPPORTED ---
  if (!biometricStatus.supported) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm ring-1 ring-red-100">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Biometric Not Supported</h3>
              <p className="text-sm text-gray-500">Hardware requirement not met</p>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Incompatible Environment</h4>
                <p className="mt-2 text-sm leading-relaxed text-red-700/80">
                  Biometric authentication is not supported on this{" "}
                  <span className="font-semibold">{appContext.isApplication ? `${appContext.context} app` : "browser or device"}</span>.
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  {appContext.isApplication
                    ? `To use biometric authentication, ensure your device has hardware capabilities and the app has permissions.`
                    : "Please try using a modern browser (Chrome, Edge, Safari) on a device with a fingerprint sensor or Face ID."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // --- STATE 2: NOT AVAILABLE ---
  if (!biometricStatus.available) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm ring-1 ring-amber-100">
              <Fingerprint className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sensor Unavailable</h3>
              <p className="text-sm text-gray-500">Device security settings check</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-800">Setup Required</h4>
                <p className="mt-2 text-sm leading-relaxed text-amber-800/80">
                  We couldn't detect an active biometric authenticator.
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>Check if device screen lock (PIN/Pattern) is enabled.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>Ensure Fingerprint/Face ID is registered in OS settings.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // --- STATE 3: MAIN DASHBOARD ---
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/50 transition-all duration-300 md:p-8"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-50 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-50 blur-3xl opacity-50 pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <Fingerprint className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Biometric Security</h3>
            <p className="text-sm text-slate-500 font-medium">Passkeys & Hardware Authentication</p>
          </div>
        </div>
        
        {appContext.isApplication && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            <Smartphone className="h-3.5 w-3.5" />
            {appContext.context} App
          </span>
        )}
      </div>

      {/* Main Action Area */}
      <div className="relative z-10 mb-10">
        <p className="mb-6 text-slate-600 leading-relaxed max-w-2xl">
          Enhance your account protection by enabling biometric authentication. 
          Login securely using your <span className="font-semibold text-slate-800">Fingerprint, Face ID, or Windows Hello</span> 
          without needing to type a password.
        </p>

        {/* Dynamic Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!biometricStatus.enabled ? (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={registerBiometric}
              disabled={loading}
              className="relative overflow-hidden flex-1 sm:flex-none inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Configuring Device...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  <span>Activate Biometric Login</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#fee2e2" }}
              whileTap={{ scale: 0.97 }}
              onClick={disableBiometric}
              disabled={loading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 rounded-xl border-2 border-red-100 bg-red-50 px-8 py-4 text-base font-semibold text-red-600 transition-all duration-300 hover:border-red-200 hover:text-red-700 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Disable Biometrics</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Animated Alerts */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-8 overflow-hidden"
          >
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-center gap-3 text-emerald-800 shadow-sm backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span className="font-medium text-sm">{message}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-8 overflow-hidden"
          >
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 flex items-center gap-3 text-red-800 shadow-sm backdrop-blur-sm">
              <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative z-10">
        <motion.div variants={cardVariants} whileHover="hover" className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 backdrop-blur-sm transition-colors hover:border-indigo-100 hover:bg-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Environment</span>
            {biometricStatus.supported ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
              {appContext.isApplication ? <Smartphone className="h-5 w-5 text-indigo-500" /> : <Globe className="h-5 w-5 text-blue-500" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-700">Supported</div>
              <div className="text-xs text-slate-500">System Check Passed</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} whileHover="hover" className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 backdrop-blur-sm transition-colors hover:border-indigo-100 hover:bg-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Hardware</span>
            {biometricStatus.available ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-amber-500" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
              <MonitorSmartphone className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-700">Available</div>
              <div className="text-xs text-slate-500">Sensor Detected</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} whileHover="hover" className={`rounded-2xl border p-5 backdrop-blur-sm transition-all ${biometricStatus.enabled ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Status</span>
            <div className={`h-2 w-2 rounded-full ${biometricStatus.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 shadow-sm ring-1 ${biometricStatus.enabled ? 'bg-emerald-100 ring-emerald-200' : 'bg-white ring-slate-100'}`}>
              {biometricStatus.enabled ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <Unlock className="h-5 w-5 text-slate-400" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${biometricStatus.enabled ? 'text-emerald-700' : 'text-slate-700'}`}>
                {biometricStatus.enabled ? 'Active' : 'Disabled'}
              </div>
              <div className="text-xs text-slate-500">Current State</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accordion / Details Section */}
      <div className="relative z-10 border-t border-slate-100 pt-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="group flex w-full items-center justify-between rounded-xl bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-indigo-500">
              <Info className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">How it works & Benefits</span>
          </div>
          <motion.div
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Benefits List */}
                <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-5 border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 font-semibold text-slate-800">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    Security Benefits
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "End-to-end encrypted authentication",
                      "Phishing-resistant (WebAuthn Standard)",
                      "No password transmission",
                      "Instant login experience"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Troubleshooting List */}
                <div className="rounded-2xl bg-gradient-to-br from-white to-amber-50/30 p-5 border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 font-semibold text-slate-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Troubleshooting
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="block h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>Ensure you are using HTTPS (Secure Context)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="block h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>Clean sensor surface or try alternative finger</span>
                    </li>
                    {appContext.isApplication && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="block h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>Check app permissions in OS settings</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default BiometricSetup