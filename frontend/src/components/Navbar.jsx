"use client"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import "../styles/navbar.css"

const Navbar = ({ user, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link"
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/dashboard" className="nav-brand" onClick={closeMobileMenu}>
            <i className="fas fa-folder-open"></i>
            Family Portal
          </Link>

          <div className="nav-menu">
            <Link to="/dashboard" className={isActive("/dashboard")}>
              <i className="fas fa-home"></i>
              Dashboard
            </Link>
            <Link to="/upload" className={isActive("/upload")}>
              <i className="fas fa-cloud-upload-alt"></i>
              Upload
            </Link>
            <Link to="/my-documents" className={isActive("/my-documents")}>
              <i className="fas fa-file-alt"></i>
              My Documents
            </Link>
            <Link to="/biometric-settings" className={isActive("/biometric-settings")}>
              <i className="fas fa-fingerprint"></i>
              Biometric
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className={isActive("/admin")}>
                <i className="fas fa-cog"></i>
                Admin Panel
              </Link>
            )}
          </div>

          <div className="nav-user">
            <div className="user-info">
              <div className="user-name">
                <i className="fas fa-user"></i>
                {user.fullName}
                {user.role === "admin" && <span className="admin-badge">Admin</span>}
                {user.biometricEnabled && (
                  <span className="biometric-badge">
                    <i className="fas fa-fingerprint"></i>
                  </span>
                )}
              </div>
              <div className="user-role">
                <i className="fas fa-id-badge"></i>
                {user.role === "admin" ? "Administrator" : "Family Member"}
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-outline">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-user-info">
          <div className="user-name">
            <i className="fas fa-user"></i>
            {user.fullName}
            {user.role === "admin" && <span className="admin-badge">Admin</span>}
            {user.biometricEnabled && (
              <span className="biometric-badge">
                <i className="fas fa-fingerprint"></i>
              </span>
            )}
          </div>
          <div className="user-role">
            <i className="fas fa-id-badge"></i>
            {user.role === "admin" ? "Administrator" : "Family Member"}
          </div>
        </div>

        <div className="mobile-nav-menu">
          <Link to="/dashboard" className={isActive("/dashboard")} onClick={closeMobileMenu}>
            <i className="fas fa-home"></i>
            Dashboard
          </Link>
          <Link to="/upload" className={isActive("/upload")} onClick={closeMobileMenu}>
            <i className="fas fa-cloud-upload-alt"></i>
            Upload
          </Link>
          <Link to="/my-documents" className={isActive("/my-documents")} onClick={closeMobileMenu}>
            <i className="fas fa-file-alt"></i>
            My Documents
          </Link>
          <Link to="/biometric-settings" className={isActive("/biometric-settings")} onClick={closeMobileMenu}>
            <i className="fas fa-fingerprint"></i>
            Biometric
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" className={isActive("/admin")} onClick={closeMobileMenu}>
              <i className="fas fa-cog"></i>
              Admin Panel
            </Link>
          )}
        </div>

        <button
          onClick={() => {
            onLogout()
            closeMobileMenu()
          }}
          className="btn btn-outline btn-full"
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </>
  )
}

export default Navbar
