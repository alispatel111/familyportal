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

      if (window.showToast) {
        window.showToast("success", "Account Created!", `Welcome to Family Portal, ${response.data.user.fullName}!`)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed"
      
      setErrors({
        ...errors,
        form: errorMessage
      })

      if (window.showToast) {
        window.showToast("error", "Signup Failed", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Graphics */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12 text-white">
            <div className="h-full flex flex-col justify-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold mb-4">Join the Family Portal</h1>
                <p className="text-blue-100 mb-8">Create your account to start managing family documents securely.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">End-to-End Encryption</h3>
                    <p className="text-sm text-blue-100">Your documents are encrypted at rest and in transit</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Family Sharing</h3>
                    <p className="text-sm text-blue-100">Share documents securely with family members</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">24/7 Access</h3>
                    <p className="text-sm text-blue-100">Access your documents from anywhere, anytime</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-blue-100 italic">"Secure your family's memories and important documents in one safe place"</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-600 mt-2">Fill in your details to get started</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700">{errors.form}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="John Doe"
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${
                        errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                      } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400`}
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.fullName && touched.fullName ? 'text-red-500' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors duration-300`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-sm animate-fade-in">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="johndoe"
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${
                        errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                      } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400`}
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.username && touched.username ? 'text-red-500' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors duration-300`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                  </div>
                  {errors.username && touched.username && (
                    <p className="text-red-500 text-sm animate-fade-in">{errors.username}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${
                      errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400`}
                  />
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.email && touched.email ? 'text-red-500' : 'text-gray-400'
                  } group-focus-within:text-blue-500 transition-colors duration-300`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm animate-fade-in">{errors.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="••••••••"
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${
                        errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400`}
                      minLength="6"
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.password && touched.password ? 'text-red-500' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors duration-300`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-sm animate-fade-in">{errors.password}</p>
                  )}
                  
                  {formData.password && !errors.password && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slide-down">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h4 className="font-semibold text-blue-800">Password Requirements</h4>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          At least 6 characters long
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Mix of letters and numbers
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.642 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Avoid common passwords
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="••••••••"
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400`}
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors duration-300`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-sm animate-fade-in">{errors.confirmPassword}</p>
                  )}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Create Account</span>
                    </>
                  )}
                </div>
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-600">Already have an account?</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 group"
                >
                  <span>Sign In Here</span>
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
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
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

export default Signup