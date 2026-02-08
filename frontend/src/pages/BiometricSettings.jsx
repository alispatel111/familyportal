"use client"

import { useState } from "react"
import BiometricSetup from "../components/BiometricSetup"

const BiometricSettings = ({ user }) => {
  const [userInfo, setUserInfo] = useState(user)
  const [activeSection, setActiveSection] = useState("setup")
  
  const handleBiometricUpdate = () => {
    console.log("Biometric settings updated")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Biometric Authentication</h1>
                  <p className="text-blue-100 mt-2">Secure your account with fingerprint or face recognition</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setActiveSection("setup")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeSection === "setup"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  Setup & Management
                </button>
                <button
                  onClick={() => setActiveSection("security")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeSection === "security"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  Security Tips
                </button>
                <button
                  onClick={() => setActiveSection("compatibility")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeSection === "compatibility"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  Device Compatibility
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-sm text-blue-100 mb-2">Current Status</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Biometric Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biometric Setup Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/40">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Biometric Setup
              </h2>
              <BiometricSetup user={userInfo} onUpdate={handleBiometricUpdate} />
            </div>

            {/* Setup Guide */}
            {activeSection === "setup" && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Setup Guide</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Enable Device Biometrics", desc: "Make sure biometric authentication is enabled in your device settings" },
                    { step: 2, title: "Register Fingerprint/Face", desc: "Add your biometric data to your device's security settings" },
                    { step: 3, title: "Browser Permission", desc: "Allow browser to access biometric sensors when prompted" },
                    { step: 4, title: "Test Authentication", desc: "Try logging in with biometrics to verify setup" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300 animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Security Tips */}
            {(activeSection === "setup" || activeSection === "security") && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/40">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security Tips
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Device Security",
                      desc: "Always use a screen lock (PIN, pattern, or password) as backup",
                      icon: "🔒"
                    },
                    {
                      title: "Sensor Maintenance",
                      desc: "Keep fingerprint sensor and camera clean for better recognition",
                      icon: "👆"
                    },
                    {
                      title: "Software Updates",
                      desc: "Keep your browser and OS updated for latest security features",
                      icon: "🔄"
                    },
                    {
                      title: "Public Devices",
                      desc: "Avoid setting up biometrics on shared or public devices",
                      icon: "🚫"
                    }
                  ].map((tip, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50/50 border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{tip.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{tip.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Device Compatibility */}
            {(activeSection === "setup" || activeSection === "compatibility") && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Device Compatibility
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      device: "Desktop/Laptop",
                      details: "Windows Hello, Touch ID (Mac), USB Security Keys",
                      icon: "🖥️",
                      color: "blue"
                    },
                    {
                      device: "Mobile Devices",
                      details: "Fingerprint, Face ID/Recognition, Device PIN",
                      icon: "📱",
                      color: "purple"
                    },
                    {
                      device: "Web Browsers",
                      details: "Chrome 67+, Firefox 60+, Safari 14+, Edge 18+",
                      icon: "🌐",
                      color: "green"
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{item.device}</h4>
                            <p className="text-sm text-gray-600 mt-1 max-w-[200px]">{item.details}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 bg-${item.color}-400 rounded-full animate-pulse`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600">Biometric Users</span>
                  <span className="font-bold text-blue-600">24</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-green-600">98.7%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600">Last Used</span>
                  <span className="font-bold text-gray-800">2 hours ago</span>
                </div>
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
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default BiometricSettings