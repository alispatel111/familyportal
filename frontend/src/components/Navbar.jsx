"use client"
import { Link, useLocation } from "react-router-dom"

const Navbar = ({ user, onLogout }) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link"
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          📁 Family Portal
        </Link>

        <div className="nav-menu">
          <Link to="/dashboard" className={isActive("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/upload" className={isActive("/upload")}>
            Upload
          </Link>
          <Link to="/my-documents" className={isActive("/my-documents")}>
            My Documents
          </Link>
          <Link to="/biometric-settings" className={isActive("/biometric-settings")}>
            🔐 Biometric
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" className={isActive("/admin")}>
              Admin Panel
            </Link>
          )}
        </div>

        <div className="nav-user">
          <span className="user-info">
            Welcome, {user.fullName}
            {user.role === "admin" && <span className="admin-badge">Admin</span>}
            {user.biometricEnabled && <span className="biometric-badge">🔐</span>}
          </span>
          <button onClick={onLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
