"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import axios from "axios"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Upload from "./pages/Upload"
import MyDocuments from "./pages/MyDocuments"
import AdminPanel from "./pages/AdminPanel"
import BiometricSettings from "./pages/BiometricSettings"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorBoundary from "./components/ErrorBoundary"
import ToastContainer from "./components/ToastContainer"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log("🔍 Checking authentication status...")
      const response = await axios.get("/api/auth/me")
      console.log("✅ User authenticated:", response.data.user)
      setUser(response.data.user)
      setError(null)
    } catch (error) {
      console.log("❌ Not authenticated:", error.response?.data?.message || error.message)
      setUser(null)

      // Only set error for actual server errors, not authentication failures
      if (error.code === "ERR_NETWORK" || error.response?.status >= 500) {
        setError("Unable to connect to server. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    console.log("✅ User logged in:", userData)
    setUser(userData)
    setError(null)

    // Don't show toast here as it's already shown in Login component
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
      setUser(null)
      console.log("✅ User logged out")

      // Show logout toast
      if (window.showToast) {
        window.showToast("info", "Logged out", "You have been successfully logged out.")
      }
    } catch (error) {
      console.error("❌ Logout error:", error)
      // Force logout on client side even if server request fails
      setUser(null)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>
            <i className="fas fa-exclamation-triangle"></i> Connection Error
          </h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {user && <Navbar user={user} onLogout={handleLogout} />}
          <main className="main-content">
            <Routes>
              <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
              <Route path="/signup" element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
              <Route path="/my-documents" element={user ? <MyDocuments /> : <Navigate to="/login" />} />
              <Route
                path="/biometric-settings"
                element={user ? <BiometricSettings user={user} /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin"
                element={user && user.role === "admin" ? <AdminPanel /> : <Navigate to="/dashboard" />}
              />
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
