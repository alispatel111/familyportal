"use client"

import { useState } from "react"
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

  // Check biometric support on component mount
  useState(() => {
    const checkBiometricSupport = () => {
      const supported = !!(navigator.credentials && navigator.credentials.create)
      setBiometricSupported(supported)
    }
    checkBiometricSupport()
  }, [])

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
    onLogin(userData)
  }

  const handleBiometricCancel = () => {
    setShowBiometric(false)
    setError("")
  }

  if (showBiometric) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <BiometricLogin onLogin={handleBiometricLogin} onCancel={handleBiometricCancel} />
        </div>
      </div>
    )
  }

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

          {biometricSupported && (
            <div className="biometric-option">
              <div className="divider">
                <span>OR</span>
              </div>
              <button type="button" onClick={() => setShowBiometric(true)} className="btn btn-outline biometric-btn">
                🔐 Login with Biometrics
              </button>
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
