"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import BiometricLogin from "../components/BiometricLogin"

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricUsersCount, setBiometricUsersCount] = useState(0)
  const [isFocused, setIsFocused] = useState({ username: false, password: false })
  const containerRef = useRef(null)

  useEffect(() => {
    checkBiometricSupport()
    
    // Add floating particles effect
    const container = containerRef.current
    if (container) {
      createFloatingParticles(container)
    }
    
    return () => {
      // Cleanup particles on unmount
      const particles = document.querySelectorAll('.floating-particle')
      particles.forEach(particle => particle.remove())
    }
  }, [])

  const createFloatingParticles = (container) => {
    const colors = ['#8B5CF6', '#06B6D4', '#3B82F6', '#10B981']
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div')
      particle.className = 'floating-particle'
      
      // Random properties
      const size = Math.random() * 8 + 4
      const color = colors[Math.floor(Math.random() * colors.length)]
      const posX = Math.random() * 100
      const posY = Math.random() * 100
      const duration = Math.random() * 15 + 15
      const delay = Math.random() * 5
      
      // Apply styles
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: ${Math.random() * 0.4 + 0.1};
        left: ${posX}%;
        top: ${posY}%;
        pointer-events: none;
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
        filter: blur(1px);
        z-index: 0;
      `
      
      container.appendChild(particle)
    }
    
    // Add keyframes for floating animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatParticle {
        0%, 100% {
          transform: translate(0, 0) rotate(0deg);
          opacity: 0.2;
        }
        25% {
          transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(45deg);
          opacity: 0.5;
        }
        50% {
          transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) rotate(90deg);
          opacity: 0.3;
        }
        75% {
          transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(135deg);
          opacity: 0.6;
        }
      }
    `
    document.head.appendChild(style)
  }

  const checkBiometricSupport = async () => {
    try {
      console.log("🔍 Checking biometric support...")

      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)
      console.log("🔐 WebAuthn supported:", supported)

      if (supported && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricAvailable(available)
        console.log("👆 Platform authenticator available:", available)

        if (available) {
          try {
            const response = await axios.get("/api/auth/biometric/check-availability")
            console.log("👥 Biometric availability check:", response.data)
            setBiometricUsersCount(response.data.count || 0)
          } catch (error) {
            console.log("ℹ️ No biometric users found or server error:", error.response?.data?.message)
            setBiometricUsersCount(0)
          }
        }
      }
    } catch (error) {
      console.error("❌ Error checking biometric support:", error)
      setBiometricSupported(false)
      setBiometricAvailable(false)
      setBiometricUsersCount(0)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true })
  }

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/auth/login", formData)

      // Show success toast only once
      if (window.showToast) {
        window.showToast("success", "Login Successful!", `Welcome back, ${response.data.user.fullName}!`)
      }

      // Call onLogin after showing toast
      onLogin(response.data.user)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      setError(errorMessage)

      // Show error toast only once
      if (window.showToast) {
        window.showToast("error", "Login Failed", errorMessage)
      }
      
      // Shake animation for error
      const form = e.target
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
      }, 500)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = (userData) => {
    console.log("✅ Biometric login successful:", userData)

    // Show success toast only once
    if (window.showToast) {
      window.showToast("success", "Biometric Login Successful!", `Welcome back, ${userData.fullName}!`)
    }

    // Call onLogin after showing toast
    onLogin(userData)
  }

  const handleBiometricCancel = () => {
    console.log("❌ Biometric login cancelled")
    setShowBiometric(false)
    setError("")
  }

  const startBiometricLogin = () => {
    console.log("🚀 Starting biometric login flow...")
    setError("")
    setShowBiometric(true)
  }

  if (showBiometric) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-cyan-50 to-purple-50 px-4 relative overflow-hidden">
        <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] relative z-10">
          <BiometricLogin onLogin={handleBiometricLogin} onCancel={handleBiometricCancel} />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-10 animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-400 rounded-full filter blur-3xl opacity-10 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
      </div>
    )
  }

  const showBiometricButton = biometricSupported && biometricAvailable && biometricUsersCount > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-purple-50 py-8 relative overflow-hidden" ref={containerRef}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.005] md:grid md:grid-cols-2 md:gap-12 relative overflow-hidden">
          {/* Left side - Branding */}
          <div className="mb-5 flex flex-col items-center justify-center md:mb-0">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-2xl text-white shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl">
              <i className="fas fa-user-lock"></i>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 font-display mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">Family Document Portal</h1>
              <p className="text-gray-600">Secure • Organized • Accessible</p>
            </div>
            
            <div className="mt-10 hidden md:block">
              <div className="h-64 w-64 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full opacity-20 blur-3xl absolute -left-20 -z-10 animate-pulse-slow"></div>
              <div className="h-64 w-64 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20 blur-3xl absolute -right-20 -z-10 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Member Login</h2>
              <p className="text-gray-600">Welcome back! Please sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 transition-all duration-300 animate-fade-in">
                  <i className="fas fa-exclamation-circle mt-0.5 text-red-500"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => handleFocus('username')}
                    onBlur={() => handleBlur('username')}
                    required
                    placeholder="Enter your email or username"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 peer"
                  />
                  <i className={`fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 ${isFocused.username ? 'text-indigo-500' : ''}`}></i>
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 ${isFocused.username ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 peer"
                  />
                  <i className={`fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 ${isFocused.password ? 'text-indigo-500' : ''}`}></i>
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 ${isFocused.password ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>

              <button
                type="submit"
                className={`inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 transform ${loading ? "opacity-90 cursor-not-allowed" : "hover:shadow-xl hover:from-indigo-600 hover:to-cyan-600 hover:-translate-y-0.5"} focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 relative overflow-hidden group`}
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span>LOGIN</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              </button>

              {showBiometricButton && (
                <div className="pt-2">
                  <div className="relative my-5 text-center text-xs text-gray-400">
                    <span className="bg-white px-3">OR</span>
                    <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                  <button
                    type="button"
                    onClick={startBiometricLogin}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-100 group relative overflow-hidden"
                  >
                    <i className="fas fa-fingerprint text-indigo-500 transition-all duration-300 group-hover:scale-110"></i>
                    <span>Login with Biometrics</span>
                    <span className="absolute inset-0 bg-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-150"></span>
                  </button>
                  <div className="mt-3 text-center text-xs text-gray-500 animate-pulse">
                    <i className="fas fa-users mr-1.5 text-indigo-400"></i>
                    <strong>
                      {biometricUsersCount} user{biometricUsersCount !== 1 ? "s" : ""}
                    </strong> registered for biometric login
                  </div>
                </div>
              )}

              {biometricSupported && biometricAvailable && biometricUsersCount === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-800 transition-all duration-300 hover:bg-amber-50 animate-fade-in">
                  <i className="fas fa-lightbulb mr-2 text-amber-500"></i>
                  <strong>Enable biometric login:</strong> Go to Settings → Biometric after login to setup instant authentication!
                </div>
              )}
            </form>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-gray-600 text-sm">Don't have an account?</p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-100 group relative overflow-hidden"
              >
                <i className="fas fa-user-plus text-indigo-500 transition-all duration-300 group-hover:scale-110"></i>
                <span>Create Account</span>
                <span className="absolute inset-0 bg-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-250"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .shake {
            animation: shake 0.5s ease-in-out;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  )
}

export default Login