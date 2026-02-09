"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { 
  Shield, AlertCircle, ArrowRight, 
  Sparkles, CheckCircle2 
} from "lucide-react"

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
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReqs, setShowReqs] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({ ...touched, [name]: true })
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let error = ""
    switch(name) {
      case "fullName": if (!value.trim()) error = "Full name is required"; break
      case "username": if (!value.trim()) error = "Username is required"; else if (value.length < 3) error = "3+ characters needed"; break
      case "email": if (!value.trim()) error = "Email is required"; else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email"; break
      case "password": if (!value) error = "Required"; else if (value.length < 6) error = "6+ characters"; break
      case "confirmPassword": if (value !== formData.password) error = "Passwords mismatch"; break
      default: break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error === ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ fullName: true, username: true, email: true, password: true, confirmPassword: true })
    
    // Validate all fields before delay
    let isValid = true
    Object.keys(formData).forEach(key => {
        if(!validateField(key, formData[key])) isValid = false
    })
    if (!isValid) return

    setLoading(true)

    // 3 Second Loading Delay before Signup API
    setTimeout(async () => {
      try {
        const response = await axios.post("/api/auth/signup", {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
        })
        if (window.showToast) window.showToast("success", "Account Created!", `Welcome, ${response.data.user.fullName}!`)
        onLogin(response.data.user)
      } catch (error) {
        setErrors(prev => ({ ...prev, form: error.response?.data?.message || "Signup failed" }))
        setLoading(false)
      }
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fafafa] font-sans">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#080808] relative overflow-hidden items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="relative z-10 p-16 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
             <Sparkles className="w-4 h-4 text-indigo-400" />
             <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">v2.0 Encryption</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-8">Start Your <span className="text-indigo-500 underline underline-offset-8 decoration-indigo-500/30">Secure</span> Journey.</h1>
          <p className="text-gray-400 text-lg">Create a master account to manage family documents with world-class security.</p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20 relative">
        <div className={`w-full max-w-[480px] transition-all duration-1000 ${isAnimating ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Join the vault today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-red-700">{errors.form}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required placeholder=" " 
                  className={`peer w-full px-6 py-4 bg-white border-2 rounded-[1.2rem] outline-none transition-all focus:border-indigo-600 text-gray-900 font-bold ${errors.fullName && touched.fullName ? 'border-red-200 bg-red-50' : 'border-gray-100'}`} />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none transition-all peer-focus:top-0 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0">Full Name</label>
              </div>
              <div className="relative group">
                <input type="text" name="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} required placeholder=" " 
                  className={`peer w-full px-6 py-4 bg-white border-2 rounded-[1.2rem] outline-none transition-all focus:border-indigo-600 text-gray-900 font-bold ${errors.username && touched.username ? 'border-red-200 bg-red-50' : 'border-gray-100'}`} />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none transition-all peer-focus:top-0 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0">Username</label>
              </div>
            </div>

            <div className="relative group">
              <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required placeholder=" " 
                className={`peer w-full px-6 py-4 bg-white border-2 rounded-[1.2rem] outline-none transition-all focus:border-indigo-600 text-gray-900 font-bold ${errors.email && touched.email ? 'border-red-200 bg-red-50' : 'border-gray-100'}`} />
              <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none transition-all peer-focus:top-0 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0">Email Address</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setShowReqs(true)} onBlur={() => setShowReqs(false)} required placeholder=" " 
                  className="peer w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.2rem] outline-none focus:border-indigo-600 text-gray-900 font-bold" />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none transition-all peer-focus:top-0 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0">Password</label>
                
                {/* Requirements Dropdown */}
                {showReqs && (
                  <div className="absolute z-30 top-full mt-2 w-full bg-white border border-indigo-100 shadow-xl p-4 rounded-2xl animate-in zoom-in duration-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vault Rules</p>
                    <ul className="space-y-1">
                      <li className={`text-[11px] font-bold flex items-center gap-2 ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-300'}`}><CheckCircle2 className="w-3 h-3" /> 6+ Characters</li>
                      <li className={`text-[11px] font-bold flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`}><CheckCircle2 className="w-3 h-3" /> Include Numbers</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative group">
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder=" " 
                  className={`peer w-full px-6 py-4 bg-white border-2 rounded-[1.2rem] outline-none focus:border-indigo-600 text-gray-900 font-bold ${errors.confirmPassword ? 'border-red-200' : 'border-gray-100'}`} />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none transition-all peer-focus:top-0 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0">Confirm</label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-xl active:scale-[0.98]">
              <div className="flex items-center justify-center gap-3">
                {loading ? (<><div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div><span>Creating Identity...</span></>) : (<><span>Generate Account</span><ArrowRight className="w-5 h-5" /></>)}
              </div>
            </button>
          </form>
          <p className="mt-10 text-center text-gray-400 font-bold text-sm">Already a member? <Link to="/login" className="text-indigo-600 hover:underline">Sign In Instead</Link></p>
        </div>
      </div>
    </div>
  )
}
export default Signup