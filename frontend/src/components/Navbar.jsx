"use client"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

const Navbar = ({ user, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeHover, setActiveHover] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className={`bg-white border-gray-200 dark:bg-gray-900 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 rtl:space-x-reverse group"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <i className="fas fa-folder-open h-8 text-blue-700 dark:text-blue-600 relative transform transition-transform duration-300 group-hover:scale-110"></i>
            </div>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
              Family Portal
            </span>
          </Link>
          
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <i className="fas fa-user text-gray-500 dark:text-gray-400 relative transform transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-600"></i>
                  </div>
                  {user.fullName}
                  {user.role === "admin" && (
                    <span className="rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-2 py-0.5 text-xs font-semibold text-white shadow-sm transform transition-transform duration-300 hover:scale-105">
                      Admin
                    </span>
                  )}
                  {user.biometricEnabled && (
                    <span className="text-blue-700 dark:text-blue-600 transform transition-transform duration-300 hover:scale-110">
                      <i className="fas fa-fingerprint"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              type="button"
              className="relative overflow-hidden text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transform transition-transform duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                <i className="fas fa-sign-out-alt mr-2 transform transition-transform duration-500 hover:rotate-90"></i>
                Logout
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900 opacity-0 transition-opacity duration-300 hover:opacity-100"></span>
            </button>
            
            <button 
              onClick={toggleMobileMenu}
              data-collapse-toggle="navbar-cta" 
              type="button" 
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-all duration-300 hover:scale-110" 
              aria-controls="navbar-cta" 
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 17 14"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>
          </div>
          
          <div 
            className={`items-center justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'block animate-fadeIn' : 'hidden'}`} 
            id="navbar-cta"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {[
                { path: "/dashboard", icon: "fa-home", label: "Dashboard" },
                { path: "/upload", icon: "fa-cloud-upload-alt", label: "Upload" },
                { path: "/my-documents", icon: "fa-file-alt", label: "My Documents" },
                { path: "/biometric-settings", icon: "fa-fingerprint", label: "Biometric" },
                ...(user.role === "admin" ? [{ path: "/admin", icon: "fa-cog", label: "Admin Panel" }] : [])
              ].map((item) => (
                <li key={item.path} 
                  onMouseEnter={() => setActiveHover(item.path)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <Link
                    to={item.path}
                    className={`relative block py-2 px-3 md:p-0 rounded-sm transition-all duration-300 group ${isActive(item.path) 
                      ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500" 
                      : "text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="flex items-center">
                      <i className={`fas ${item.icon} mr-2 transition-all duration-300 ${activeHover === item.path ? 'transform scale-125' : ''}`}></i>
                      {item.label}
                    </span>
                    
                    {/* Animated underline effect */}
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full ${isActive(item.path) ? 'w-full' : ''}`}></span>
                    
                    {/* Hover background effect for mobile */}
                    <span className="absolute inset-0 bg-blue-100 opacity-0 transition-opacity duration-300 rounded group-hover:opacity-20 md:group-hover:opacity-10 -z-10"></span>
                  </Link>
                </li>
              ))}
              
              {/* Mobile user info */}
              <li className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slideUp">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-blue-200 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-30"></div>
                    <i className="fas fa-user text-gray-500 dark:text-gray-400 relative"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.role === "admin" ? "Administrator" : "Family Member"}
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <span className="rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-2 py-0.5 text-xs font-semibold text-white shadow-sm ml-auto">
                      Admin
                    </span>
                  )}
                  {user.biometricEnabled && (
                    <span className="text-blue-700 dark:text-blue-600">
                      <i className="fas fa-fingerprint"></i>
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default Navbar