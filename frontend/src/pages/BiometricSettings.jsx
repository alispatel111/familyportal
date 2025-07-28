"use client"

import { useState } from "react"
import BiometricSetup from "../components/BiometricSetup"

const BiometricSettings = ({ user }) => {
  const [userInfo, setUserInfo] = useState(user)

  const handleBiometricUpdate = () => {
    // Refresh user info or trigger parent component update
    console.log("Biometric settings updated")
  }

  return (
    <div className="biometric-settings">
      <div className="settings-header">
        <h1>🔐 Biometric Settings</h1>
        <p>Manage your biometric authentication preferences</p>
      </div>

      <div className="settings-content">
        <BiometricSetup user={userInfo} onUpdate={handleBiometricUpdate} />

        <div className="security-tips">
          <h3>🛡️ Security Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>🔒 Keep Your Device Secure</h4>
              <p>
                Always use a screen lock (PIN, pattern, or password) on your device as a backup authentication method.
              </p>
            </div>

            <div className="tip-card">
              <h4>👆 Clean Sensors</h4>
              <p>Keep your fingerprint sensor and camera clean for better recognition accuracy.</p>
            </div>

            <div className="tip-card">
              <h4>🔄 Regular Updates</h4>
              <p>Keep your browser and operating system updated for the latest security features.</p>
            </div>

            <div className="tip-card">
              <h4>🚫 Public Devices</h4>
              <p>Avoid setting up biometric authentication on shared or public devices.</p>
            </div>
          </div>
        </div>

        <div className="compatibility-info">
          <h3>📱 Device Compatibility</h3>
          <div className="compatibility-list">
            <div className="compatibility-item">
              <span className="device-type">🖥️ Desktop/Laptop:</span>
              <span className="device-support">Windows Hello, Touch ID (Mac), USB Security Keys</span>
            </div>

            <div className="compatibility-item">
              <span className="device-type">📱 Mobile:</span>
              <span className="device-support">Fingerprint, Face ID/Recognition, Device PIN</span>
            </div>

            <div className="compatibility-item">
              <span className="device-type">🌐 Browsers:</span>
              <span className="device-support">Chrome 67+, Firefox 60+, Safari 14+, Edge 18+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiometricSettings
