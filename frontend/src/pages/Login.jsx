"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import BiometricLogin from "../components/BiometricLogin"
import "../styles/auth.css"

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

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const checkBiometricSupport = async () => {
    try {
      console.log("🔍 Checking biometric support...")

      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)
      console.log("🔐 WebAuthn supported:", supported)

      if (supported && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricAvailable(available)
        console.log("👆 Platform authenticator available:", available)

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
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/auth/login", formData)

      // Show success toast only once
      if (window.showToast) {
        window.showToast("success", "Login Successful!", `Welcome back, ${response.data.user.fullName}!`)
      }

      // Call onLogin after showing toast
      onLogin(response.data.user)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      setError(errorMessage)

      // Show error toast only once
      if (window.showToast) {
        window.showToast("error", "Login Failed", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = (userData) => {
    console.log("✅ Biometric login successful:", userData)

    // Show success toast only once
    if (window.showToast) {
      window.showToast("success", "Biometric Login Successful!", `Welcome back, ${userData.fullName}!`)
    }

    // Call onLogin after showing toast
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
      <div className="auth-container">
        <div className="decorative-shapes">
          <div className="shape circle"></div>
          <div className="shape triangle"></div>
          <div className="shape square"></div>
        </div>
        <div className="auth-card">
          <BiometricLogin onLogin={handleBiometricLogin} onCancel={handleBiometricCancel} />
        </div>
      </div>
    )
  }

  const showBiometricButton = biometricSupported && biometricAvailable && biometricUsersCount > 0

  return (
    <div className="auth-container">
      <div className="decorative-shapes">
        <div className="shape circle"></div>
        <div className="shape triangle"></div>
        <div className="shape square"></div>
      </div>

      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="auth-brand">
            <h1>Family Document Portal</h1>
            <p>Secure • Organized • Accessible</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-header">
            <h2>Member Login</h2>
            <p>Welcome back! Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Email</label>

              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your email or username"
                className="form-input-login"
              />
              <i className="fas fa-envelope input-icon "></i>
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
                className="form-input-login"
              />
              <i className="fas fa-lock input-icon"></i>
            </div>

            <button type="submit" className={`login-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner-login"></div>
                  Signing in...
                </>
              ) : (
                "LOGIN"
              )}
            </button>

            <div className="forgot-link">
              {/* <a href="#" onClick={(e) => e.preventDefault()}>
                Forgot Username / Password?
              </a> */}
            </div>

            {showBiometricButton && (
              <div className="biometric-option">
                <div className="divider">
                  <span>OR</span>
                </div>
                <button type="button" onClick={startBiometricLogin} className="biometric-btn">
                  <i className="fas fa-fingerprint"></i>
                  Login with Biometrics
                </button>
                <div className="biometric-note">
                  <i className="fas fa-magic"></i>
                  {/* <strong>Instant Login:</strong> No username required - just use your fingerprint! */}
                  <br />
                  <i className="fas fa-users"></i>
                  <strong>
                    {biometricUsersCount} user{biometricUsersCount !== 1 ? "s" : ""}
                  </strong>{" "}
                  {/* with biometric enabled */}
                </div>
              </div>
            )}

            {biometricSupported && biometricAvailable && biometricUsersCount === 0 && (
              <div className="setup-hint">
                <i className="fas fa-lightbulb"></i>
                <strong>Enable biometric login:</strong> Go to Settings → Biometric after login to setup instant
                authentication!
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/signup">
              <i className="fas fa-user-plus"></i>
              Create your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
