"use client"

import { useState } from "react"
import BiometricSetup from "../components/BiometricSetup"

const BiometricSettings = ({ user }) => {
  const [userInfo, setUserInfo] = useState(user)
  const handleBiometricUpdate = () => {
    console.log("Biometric settings updated")
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="rounded-3xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-8 shadow-2xl shadow-blue-100/50 transition-all duration-300 hover:shadow-blue-100/70">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
            <span className="text-2xl">🔐</span>
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900">Biometric Settings</h1>
            <p className="mt-2 text-gray-600">Manage your biometric authentication preferences</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <BiometricSetup user={userInfo} onUpdate={handleBiometricUpdate} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Security Tips */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 mr-2">🛡️</span>
              Security Tips
            </h3>
            <div className="grid gap-4">
              {[
                {
                  title: "Keep Your Device Secure",
                  content: "Always use a screen lock (PIN, pattern, or password) on your device as a backup authentication method.",
                  icon: "🔒"
                },
                {
                  title: "Clean Sensors",
                  content: "Keep your fingerprint sensor and camera clean for better recognition accuracy.",
                  icon: "👆"
                },
                {
                  title: "Regular Updates",
                  content: "Keep your browser and operating system updated for the latest security features.",
                  icon: "🔄"
                },
                {
                  title: "Public Devices",
                  content: "Avoid setting up biometric authentication on shared devices.",
                  icon: "🚫"
                }
              ].map((tip, index) => (
                <div 
                  key={index}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all duration-300 hover:shadow-md hover:border-blue-100 hover:bg-blue-50/30"
                >
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">{tip.icon}</span>
                    {tip.title}
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {tip.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Device Compatibility */}
          <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-700 mr-2">📱</span>
              Device Compatibility
            </h3>
            <div className="space-y-4">
              {[
                {
                  device: "Desktop/Laptop",
                  details: "Windows Hello, Touch ID (Mac), USB Security Keys",
                  icon: "🖥️"
                },
                {
                  device: "Mobile",
                  details: "Fingerprint, Face ID/Recognition, Device PIN",
                  icon: "📱"
                },
                {
                  device: "Browsers",
                  details: "Chrome 67+, Firefox 60+, Safari 14+, Edge 18+",
                  icon: "🌐"
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg transition-all duration-300 hover:bg-purple-50/50"
                >
                  <span className="font-medium text-gray-800 flex items-center">
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.device}
                  </span>
                  <span className="text-sm text-gray-600 text-right max-w-[60%]">{item.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiometricSettings