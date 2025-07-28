"use client"

import { useState, useEffect } from "react"
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

  // Check biometric support on component mount
  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const checkBiometricSupport = async () => {
    try {
      console.log("🔍 Checking biometric support...")

      // Check if WebAuthn is supported
      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)
      console.log("🔐 WebAuthn supported:", supported)

      if (supported && window.PublicKeyCredential) {
        // Check if platform authenticator is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricAvailable(available)
        console.log("👆 Platform authenticator available:", available)

        // Check if any users have biometric enabled
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/auth/login", formData)
      onLogin(response.data.user)
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = (userData) => {
    console.log("✅ Biometric login successful:", userData)
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

  // Show biometric login component
  if (showBiometric) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <BiometricLogin onLogin={handleBiometricLogin} onCancel={handleBiometricCancel} />
        </div>
      </div>
    )
  }

  // Check if biometric login should be available
  const showBiometricButton = biometricSupported && biometricAvailable && biometricUsersCount > 0

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📁 Family Document Portal</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to access your documents</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {showBiometricButton && (
            <div className="biometric-option">
              <div className="divider">
                <span>OR</span>
              </div>
              <button type="button" onClick={startBiometricLogin} className="btn btn-outline biometric-btn">
                👆 Login with Biometrics
              </button>
              <p className="biometric-note">
                ✨ <strong>Instant Login:</strong> No username required - just use your fingerprint!
                <br />👥{" "}
                <strong>
                  {biometricUsersCount} user{biometricUsersCount !== 1 ? "s" : ""}
                </strong>{" "}
                with biometric enabled
              </p>
            </div>
          )}

          {biometricSupported && biometricAvailable && biometricUsersCount === 0 && (
            <div className="biometric-setup-hint">
              <p className="setup-hint">
                💡 <strong>Enable biometric login:</strong> Go to Settings → Biometric after login to setup instant
                authentication!
              </p>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
