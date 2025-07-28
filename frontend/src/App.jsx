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
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data.user)
    } catch (error) {
      console.log("Not authenticated")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
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
      </div>
    </Router>
  )
}

export default App
