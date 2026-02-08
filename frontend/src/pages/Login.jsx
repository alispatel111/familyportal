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
  const particlesRef = useRef([])

  useEffect(() => {
    checkBiometricSupport()
    createFloatingParticles()
    
    return () => {
      cleanupParticles()
    }
  }, [])

  const createFloatingParticles = () => {
    if (!containerRef.current) return
    
    const colors = ['#667eea', '#06b6d4', '#3b82f6', '#10b981']
    const container = containerRef.current
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.className = 'floating-particle'
      
      const size = Math.random() * 10 + 5
      const color = colors[Math.floor(Math.random() * colors.length)]
      const posX = Math.random() * 100
      const posY = Math.random() * 100
      const duration = Math.random() * 20 + 20
      const delay = Math.random() * 5
      const direction = Math.random() > 0.5 ? 1 : -1
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: ${Math.random() * 0.3 + 0.1};
        left: ${posX}%;
        top: ${posY}%;
        pointer-events: none;
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
        filter: blur(${Math.random() * 3 + 1}px);
        z-index: 0;
        will-change: transform, opacity;
      `
      
      container.appendChild(particle)
      particlesRef.current.push(particle)
    }
  }

  const cleanupParticles = () => {
    particlesRef.current.forEach(particle => {
      if (particle && particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
    particlesRef.current = []
  }

  const checkBiometricSupport = async () => {
    try {
      console.log("🔍 Checking biometric support...")

      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)

      if (supported && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricAvailable(available)

        if (available) {
          try {
            const response = await axios.get("/api/auth/biometric/check-availability")
            setBiometricUsersCount(response.data.count || 0)
          } catch (error) {
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

      if (window.showToast) {
        window.showToast("success", "Login Successful!", `Welcome back, ${response.data.user.fullName}!`)
      }

      onLogin(response.data.user)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      setError(errorMessage)

      if (window.showToast) {
        window.showToast("error", "Login Failed", errorMessage)
      }
      
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

    if (window.showToast) {
      window.showToast("success", "Biometric Login Successful!", `Welcome back, ${userData.fullName}!`)
    }

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Biometric Authentication</h2>
            <p className="text-gray-600 mt-2">Use your fingerprint or face recognition</p>
          </div>
          
          <BiometricLogin onLogin={handleBiometricLogin} onCancel={handleBiometricCancel} />
          
          <button
            onClick={handleBiometricCancel}
            className="w-full mt-4 py-2.5 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const showBiometricButton = biometricSupported && biometricAvailable && biometricUsersCount > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden" ref={containerRef}>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12 text-white">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Secure Portal</h1>
                    <p className="text-blue-100">Family Document Management</p>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                  <p className="text-blue-100 mb-8">Access your family's documents securely from anywhere.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Lightning Fast</h3>
                        <p className="text-sm text-blue-100">Instant access to documents</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Bank-Level Security</h3>
                        <p className="text-sm text-blue-100">Military-grade encryption</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Family Sharing</h3>
                        <p className="text-sm text-blue-100">Share securely with family</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-blue-100">"The most secure platform for family document management"</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Member Login</h2>
              <p className="text-gray-600 mt-2">Sign in to access your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start animate-shake">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <div className="relative group">
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
                      className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
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
                      className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-90 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
              
              {showBiometricButton && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={startBiometricLogin}
                    className="w-full border-2 border-blue-200 bg-blue-50 text-blue-700 font-medium py-3.5 px-4 rounded-xl hover:bg-blue-100 hover:border-blue-300 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                      <span>Use Biometric Login</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      <span className="font-semibold">{biometricUsersCount} user{biometricUsersCount !== 1 ? "s" : ""}</span> registered
                    </div>
                  </button>
                </>
              )}
              
              {biometricSupported && biometricAvailable && biometricUsersCount === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-amber-800">
                        <span className="font-semibold">Enable biometric login:</span> Go to Settings → Biometric after login for instant authentication!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-600">Don't have an account?</p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 group"
                >
                  <span>Create Account</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}

export default Login