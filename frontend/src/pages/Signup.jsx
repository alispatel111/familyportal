"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      })
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({
      ...touched,
      [name]: true
    })
    
    // Validate the field
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let error = ""
    
    switch(name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required"
        break
      case "username":
        if (!value.trim()) error = "Username is required"
        else if (value.length < 3) error = "Username must be at least 3 characters"
        break
      case "email":
        if (!value.trim()) error = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid"
        break
      case "password":
        if (!value) error = "Password is required"
        else if (value.length < 6) error = "Password must be at least 6 characters"
        break
      case "confirmPassword":
        if (!value) error = "Please confirm your password"
        else if (value !== formData.password) error = "Passwords do not match"
        break
      default:
        break
    }
    
    setErrors({
      ...errors,
      [name]: error
    })
    
    return error === ""
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      isValid = false
    }
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
      isValid = false
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
      isValid = false
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Mark all fields as touched to show errors
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    })
    
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("/api/auth/signup", {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
      })

      onLogin(response.data.user)

      // Show success toast
      if (window.showToast) {
        window.showToast("success", "Account Created!", `Welcome to Family Portal, ${response.data.user.fullName}!`)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed"
      
      // Set a general form error
      setErrors({
        ...errors,
        form: errorMessage
      })

      // Show error toast
      if (window.showToast) {
        window.showToast("error", "Signup Failed", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm animate-slide-up">
        {/* Left side with graphics */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-500 to-cyan-500 p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 right-14 w-16 h-16 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-folder-open text-3xl text-white"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-4 font-display">
              Family Document Portal
            </h1>
            <p className="text-center text-indigo-100 mb-8">
              Your family's secure document sharing platform
            </p>
            
            <div className="space-y-4 mt-10">
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                  <i className="fas fa-shield-alt text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Storage</h3>
                  <p className="text-sm text-indigo-100">Bank-level encryption</p>
                </div>
              </div>
              
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                  <i className="fas fa-users text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Family Sharing</h3>
                  <p className="text-sm text-indigo-100">Share with family members</p>
                </div>
              </div>
              
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                  <i className="fas fa-mobile-alt text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Anywhere Access</h3>
                  <p className="text-sm text-indigo-100">Access from any device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side with form */}
        <div className="w-full md:w-3/5 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500">Join your family's secure document portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm animate-pulse">
                <i className="fas fa-exclamation-circle mt-0.5 text-red-600"></i>
                <span>{errors.form}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">
                  Full Name
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm group-hover:opacity-30 ${errors.fullName && touched.fullName ? '!opacity-30' : ''}`}></div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your full name"
                    className={`relative w-full rounded-xl border ${errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'} bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent group-hover:bg-white/95 pl-10`}
                  />
                  <i className={`fas fa-user absolute left-3 top-1/2 -translate-y-1/2 ${errors.fullName && touched.fullName ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors duration-300`}></i>
                </div>
                {errors.fullName && touched.fullName && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 block">
                  Username
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm group-hover:opacity-30 ${errors.username && touched.username ? '!opacity-30' : ''}`}></div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Choose a username"
                    className={`relative w-full rounded-xl border ${errors.username && touched.username ? 'border-red-500' : 'border-gray-300'} bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent group-hover:bg-white/95 pl-10`}
                  />
                  <i className={`fas fa-at absolute left-3 top-1/2 -translate-y-1/2 ${errors.username && touched.username ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors duration-300`}></i>
                </div>
                {errors.username && touched.username && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm group-hover:opacity-30 ${errors.email && touched.email ? '!opacity-30' : ''}`}></div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter your email address"
                  className={`relative w-full rounded-xl border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent group-hover:bg-white/95 pl-10`}
                />
                <i className={`fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 ${errors.email && touched.email ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors duration-300`}></i>
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm group-hover:opacity-30 ${errors.password && touched.password ? '!opacity-30' : ''}`}></div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Create a strong password"
                    className={`relative w-full rounded-xl border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent group-hover:bg-white/95 pl-10`}
                    minLength="6"
                  />
                  <i className={`fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 ${errors.password && touched.password ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors duration-300`}></i>
                </div>
                {errors.password && touched.password && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.password}</p>
                )}
                {formData.password && !errors.password && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-800 backdrop-blur-sm transition-all duration-500 animate-in slide-in-from-top-1">
                    <h4 className="mb-1 font-semibold flex items-center">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Password Requirements:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>At least 6 characters long</li>
                      <li>Mix of letters and numbers recommended</li>
                      <li>Avoid common passwords</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm group-hover:opacity-30 ${errors.confirmPassword && touched.confirmPassword ? '!opacity-30' : ''}`}></div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Confirm your password"
                    className={`relative w-full rounded-xl border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'} bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent group-hover:bg-white/95 pl-10`}
                  />
                  <i className={`fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors duration-300`}></i>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-lg transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                loading ? "opacity-85" : ""
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    <span>Create Account</span>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200/70 flex items-center justify-between">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-300 flex items-center gap-1.5 group"
            >
              <span>Sign in here</span>
              <i className="fas fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-0.5"></i>
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Signup