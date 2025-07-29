"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "../styles/signup.css"

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
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

      // Show success toast
      if (window.showToast) {
        window.showToast("success", "Account Created!", `Welcome to Family Portal, ${response.data.user.fullName}!`)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed"
      setError(errorMessage)

      // Show error toast
      if (window.showToast) {
        window.showToast("error", "Signup Failed", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-decorative-shapes">
        <div className="signup-shape circle"></div>
        <div className="signup-shape triangle"></div>
        <div className="signup-shape square"></div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <h1>
            <i className="fas fa-folder-open"></i>
            Family Document Portal
          </h1>
          <h2>Create Account</h2>
          <p>Join your family's secure document portal</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="signup-error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="signup-form-group">
            <label htmlFor="fullName">
              <i className="fas fa-id-card"></i>
              Full Name
            </label>
            <div className="signup-input-wrapper">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="signup-form-input"
              />
              <i className="fas fa-id-card signup-input-icon"></i>
            </div>
          </div>

          <div className="signup-form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
              Username
            </label>
            <div className="signup-input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
                className="signup-form-input"
              />
              <i className="fas fa-user signup-input-icon"></i>
            </div>
          </div>

          <div className="signup-form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <div className="signup-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className="signup-form-input"
              />
              <i className="fas fa-envelope signup-input-icon"></i>
            </div>
          </div>

          <div className="signup-form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <div className="signup-input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className="signup-form-input"
                minLength="6"
              />
              <i className="fas fa-lock signup-input-icon"></i>
            </div>
            {formData.password && (
              <div className="password-strength">
                <h4>
                  <i className="fas fa-shield-alt"></i>
                  Password Requirements:
                </h4>
                <ul>
                  <li>At least 6 characters long</li>
                  <li>Mix of letters and numbers recommended</li>
                  <li>Avoid common passwords</li>
                </ul>
              </div>
            )}
          </div>

          <div className="signup-form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-lock"></i>
              Confirm Password
            </label>
            <div className="signup-input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="signup-form-input"
              />
              <i className="fas fa-lock signup-input-icon"></i>
            </div>
          </div>

          <button type="submit" className={`signup-btn ${loading ? "btn-loading" : ""}`} disabled={loading}>
            {loading ? (
              <>
                <div className="signup-loading-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account?</p>
          <Link to="/login">
            <i className="fas fa-sign-in-alt"></i>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
