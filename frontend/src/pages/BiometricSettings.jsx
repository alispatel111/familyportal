"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BiometricSetup from "../components/BiometricSetup"
import { 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  Settings2, 
  Lightbulb, 
  MonitorSmartphone, 
  Lock, 
  ScanFace, 
  MousePointerClick, 
  CheckCircle2, 
  Globe, 
  Laptop, 
  Activity, 
  Users, 
  Clock,
  ChevronRight,
  AlertTriangle
} from "lucide-react"

const BiometricSettings = ({ user }) => {
  const [userInfo, setUserInfo] = useState(user)
  const [activeSection, setActiveSection] = useState("setup")
  
  const handleBiometricUpdate = () => {
    console.log("Biometric settings updated")
  }

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.1 
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden p-4 md:p-6 lg:p-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Modern Header Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-8 relative overflow-hidden border border-white/50"
        >
          {/* Header Background Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start lg:items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                <Fingerprint className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Biometric Authentication</h1>
                <p className="text-blue-100 text-lg font-medium">Secure your account with next-gen passkeys</p>
                <div className="flex flex-wrap gap-2 mt-2">
                   <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10">
                     FIDO2 Certified
                   </span>
                   <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10">
                     End-to-End Encrypted
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-4 min-w-[240px]">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute inset-0" />
                  <div className="w-3 h-3 bg-emerald-400 rounded-full relative" />
                </div>
                <div>
                   <div className="text-xs text-blue-100 uppercase tracking-wider font-semibold">System Status</div>
                   <div className="font-bold text-white">Biometric Ready</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
            {[
              { id: "setup", label: "Setup & Management", icon: Settings2 },
              { id: "security", label: "Security Tips", icon: ShieldCheck },
              { id: "compatibility", label: "Device Compatibility", icon: MonitorSmartphone },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === tab.id
                    ? "bg-white text-blue-600 shadow-lg scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Component Wrapper */}
            <motion.div 
              layout
              className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <ScanFace className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Biometric Configuration</h2>
              </div>
              
              <div className="p-6 md:p-8">
                {/* PRESERVED LOGIC: Passing props to your existing component */}
                <BiometricSetup user={userInfo} onUpdate={handleBiometricUpdate} />
              </div>
            </motion.div>

            {/* Dynamic Content Section with AnimatePresence */}
            <AnimatePresence mode="wait">
              {activeSection === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    Quick Setup Guide
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { step: 1, title: "Enable Device", desc: "Check device settings", icon: Smartphone },
                      { step: 2, title: "Register Data", desc: "Add Face/Fingerprint", icon: ScanFace },
                      { step: 3, title: "Permissions", desc: "Allow browser access", icon: Lock },
                      { step: 4, title: "Test Login", desc: "Verify it works", icon: MousePointerClick }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step {item.step}</span>
                          <h4 className="font-bold text-gray-800">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Stats Widget */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Live Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Active Keys</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">24</span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                  </div>
                  <span className="font-bold text-green-600 text-lg">98.7%</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Last Used</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">2h ago</span>
                </div>
              </div>
            </motion.div>

            {/* Sidebar Content (Security/Compat) */}
            <AnimatePresence mode="wait">
              {(activeSection === "setup" || activeSection === "security") && (
                <motion.div
                  key="security-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-white to-orange-50/30 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-orange-100 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    Security Insights
                  </h3>
                  <div className="space-y-3">
                    {[
                      { title: "Screen Lock", desc: "Required as backup", icon: Lock, color: "text-orange-500", bg: "bg-orange-100" },
                      { title: "Clean Sensors", desc: "Improve recognition", icon: Fingerprint, color: "text-blue-500", bg: "bg-blue-100" },
                      { title: "Public Devices", desc: "Avoid registration", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className={`p-2 rounded-lg ${tip.bg} ${tip.color}`}>
                          <tip.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{tip.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {(activeSection === "setup" || activeSection === "compatibility") && (
                <motion.div
                  key="compat-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-white to-purple-50/30 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-purple-100 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <MonitorSmartphone className="w-5 h-5 text-purple-600" />
                    Supported Platforms
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "Desktop", desc: "Windows Hello • TouchID", icon: Laptop },
                      { name: "Mobile", desc: "FaceID • Fingerprint", icon: Smartphone },
                      { name: "Browser", desc: "Chrome • Safari • Edge", icon: Globe },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BiometricSettings