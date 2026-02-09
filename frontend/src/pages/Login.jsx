"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import BiometricLogin from "../components/BiometricLogin"
import { 
  Lock, Fingerprint, Shield, 
  LogIn, AlertCircle, Mail,
  ArrowRight, Sparkles, Globe,
  CheckCircle2, Cpu
} from "lucide-react"

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricUsersCount, setBiometricUsersCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkBiometricSupport()
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const checkBiometricSupport = async () => {
    try {
      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)
      if (supported && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricAvailable(available)
        if (available) {
          try {
            const response = await axios.get("/api/auth/biometric/check-availability")
            setBiometricUsersCount(response.data.count || 0)
          } catch { setBiometricUsersCount(0) }
        }
      }
    } catch {
      setBiometricSupported(false); setBiometricAvailable(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError("")
  }

  // --- Login Handler with 3-Second Delay ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      // 1. API Call karte hain
      const response = await axios.post("/api/auth/login", formData)
      
      // 2. 3 second ka delay (Taaki user loading state dekh sake)
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (window.showToast) {
        window.showToast("success", "Access Granted", `Welcome back, ${response.data.user.fullName}`)
      }
      
      setIsAnimating(true)
      
      // 3. Final animation aur login callback
      setTimeout(() => { 
        onLogin(response.data.user)
        setIsAnimating(false) 
      }, 500)

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
      setLoading(false) // Error aane par loading turant band
    }
    // Note: finally block hata diya hai kyunki successful login par setLoading(false) 
    // ki zarurat nahi hoti (component unmount ho jata hai)
  }

  const showBiometricButton = biometricSupported && biometricAvailable && biometricUsersCount > 0

  if (showBiometric) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="w-full max-w-md relative z-10 bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl animate-in zoom-in duration-700">
          <div className="relative inline-block mb-8">
             <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
             <div className="relative w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                <Fingerprint className="w-12 h-12 text-white" />
             </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Biometric Unlock</h2>
          <p className="text-gray-400 mb-10">Confirm your identity to enter the vault</p>
          
          <BiometricLogin onLogin={(u) => onLogin(u)} onCancel={() => setShowBiometric(false)} />
          
          <button onClick={() => setShowBiometric(false)} className="mt-8 text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-wide uppercase">
            Use Secret Key Instead
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fafafa] font-sans selection:bg-indigo-100">
      
      {/* Left Side: Brand Experience */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#080808] relative overflow-hidden items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 p-16 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-12 animate-fade-down">
             <Sparkles className="w-4 h-4 text-indigo-400" />
             <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">v2.0 Security Enabled</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-8">
            Protecting What <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Matters</span> Most.
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed">
            A premium experience designed for family security and document privacy.
          </p>
          
          <div className="mt-16 grid grid-cols-2 gap-8 text-left border-t border-white/10 pt-10">
             <div>
                <p className="text-white font-bold text-2xl">256-bit</p>
                <p className="text-gray-500 text-sm font-semibold">Encryption</p>
             </div>
             <div>
                <p className="text-white font-bold text-2xl">100%</p>
                <p className="text-gray-500 text-sm font-semibold">Privacy Focus</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Interactive Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative">
        <div className={`w-full max-w-[420px] transition-all duration-1000 ease-out ${isAnimating ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
          
          <div className="mb-12">
            <div className="lg:hidden flex items-center gap-2 mb-8">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Shield className="w-6 h-6 text-white" />
               </div>
               <span className="font-black text-xl tracking-tighter">FamilyPortal</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Please authenticate to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                   <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-bold text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="group relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="peer w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] outline-none transition-all focus:border-indigo-600 focus:shadow-[0_0_20px_rgba(79,70,229,0.05)] text-gray-900 font-bold placeholder-transparent"
                />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none transition-all 
                  peer-focus:top-0 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-2
                  peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
                  Email or Username
                </label>
              </div>

              <div className="group relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="peer w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] outline-none transition-all focus:border-indigo-600 focus:shadow-[0_0_20px_rgba(79,70,229,0.05)] text-gray-900 font-bold placeholder-transparent"
                />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none transition-all 
                  peer-focus:top-0 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-2
                  peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
                  Secret Password
                </label>
              </div>
            </div>

            <div className="flex justify-end pr-2">
                <Link to="/forgot-password" virtual className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">Lost Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full group relative overflow-hidden bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-xl shadow-indigo-100 ${loading ? 'opacity-90' : ''}`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="uppercase tracking-widest text-sm">Verifying...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Unlock Access</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </>
                )}
              </div>
            </button>

            {showBiometricButton && (
              <div className="pt-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-4 mb-6">
                   <div className="flex-1 h-[1px] bg-gray-100"></div>
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Hardware Auth</span>
                   <div className="flex-1 h-[1px] bg-gray-100"></div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBiometric(true)}
                  className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-[1.5rem] hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-500">
                      <Fingerprint className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">Touch ID / Face ID</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Stored biometric keys</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                     <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                  </div>
                </button>
              </div>
            )}
          </form>

          <div className="mt-12 text-center">
             <p className="text-gray-400 font-bold text-sm">
               New to the vault? {" "}
               <Link to="/signup" className="text-indigo-600 hover:underline underline-offset-4">Create Master Account</Link>
             </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down { animation: fade-down 0.8s ease-out; }
      `}} />
    </div>
  )
}

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
  </svg>
)

export default Login