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
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 border-b ${
          isScrolled 
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-blue-100 dark:border-gray-800 py-2" 
            : "bg-white dark:bg-gray-900 border-transparent py-4"
        }`}
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 rtl:space-x-reverse group"
            onClick={closeMobileMenu}
          >
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-inner transform transition-transform duration-500 group-hover:rotate-6">
                <i className="fas fa-folder-open text-white text-lg relative"></i>
              </div>
            </div>
            <span className="self-center text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-all duration-300">
              Family<span className="text-blue-600 dark:text-blue-500 group-hover:ml-1 transition-all">Portal</span>
            </span>
          </Link>

          <div className="flex md:order-2 items-center space-x-4">
            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:border-blue-200">
              <div className="text-right">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <i className="fas fa-user text-blue-600 text-xs"></i>
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[13px]">{user.fullName}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      {user.role === "admin" ? "Super Admin" : "User"}
                    </span>
                  </div>
                  {user.role === "admin" && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  )}
                  {user.biometricEnabled && (
                    <span className="text-emerald-500 dark:text-emerald-400 text-xs drop-shadow-sm">
                      <i className="fas fa-fingerprint animate-pulse"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              type="button"
              className="group relative px-5 py-2.5 flex items-center justify-center overflow-hidden font-bold rounded-xl transition-all duration-300 bg-gray-900 dark:bg-blue-600 text-white hover:ring-4 hover:ring-blue-500/30 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <div className="absolute inset-0 w-3 bg-white/20 transition-all duration-[700ms] ease-out -skew-x-12 -translate-x-10 group-hover:translate-x-32"></div>
              <i className="fas fa-sign-out-alt mr-2 text-blue-300 group-hover:translate-x-1 transition-transform"></i>
              <span className="hidden sm:inline relative text-sm">Logout</span>
            </button>

            <button
              onClick={toggleMobileMenu}
              data-collapse-toggle="navbar-cta"
              type="button"
              className="inline-flex items-center p-2.5 justify-center text-gray-500 rounded-xl md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all duration-300 ml-2"
              aria-controls="navbar-cta"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-5">
                <span className={`absolute block w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 top-2" : "top-0"}`}></span>
                <span className={`absolute block w-full h-0.5 bg-current transition-all duration-300 top-2 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span className={`absolute block w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 top-2" : "top-4"}`}></span>
              </div>
            </button>
          </div>

          <div
            className={`items-center justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 md:max-h-full opacity-0 md:opacity-100 overflow-hidden md:overflow-visible"}`}
            id="navbar-cta"
          >
            <ul className="flex flex-col md:flex-row items-center font-medium md:space-x-1 lg:space-x-4 rtl:space-x-reverse">
              {[
                { path: "/dashboard", icon: "fa-home", label: "Dashboard" },
                { path: "/folders", icon: "fa-folder", label: "Folders" },
                { path: "/upload", icon: "fa-cloud-upload-alt", label: "Upload" },
                { path: "/my-documents", icon: "fa-file-alt", label: "Documents" },
                { path: "/biometric-settings", icon: "fa-fingerprint", label: "Security" },
                ...(user.role === "admin" ? [{ path: "/admin", icon: "fa-shield-alt", label: "Admin" }] : []),
              ].map((item) => (
                <li
                  key={item.path}
                  onMouseEnter={() => setActiveHover(item.path)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="w-full md:w-auto"
                >
                  <Link
                    to={item.path}
                    className={`relative flex items-center py-2.5 px-4 rounded-xl transition-all duration-300 group ${
                      isActive(item.path)
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                        : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="flex items-center relative z-10">
                      <i
                        className={`fas ${item.icon} mr-2.5 text-sm transition-all duration-300 ${activeHover === item.path ? "scale-110 -translate-y-0.5" : "opacity-70"}`}
                      ></i>
                      <span className="text-[14px] tracking-wide">{item.label}</span>
                    </span>

                    {/* Active pill background */}
                    {isActive(item.path) && (
                      <span className="absolute inset-0 bg-blue-100/50 dark:bg-blue-600/10 rounded-xl -z-0"></span>
                    )}

                    {/* Underline for hover */}
                    <span
                      className={`absolute bottom-2 left-4 right-4 h-0.5 bg-blue-600 rounded-full transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100 ${isActive(item.path) ? "opacity-0" : "opacity-100"}`}
                    ></span>
                  </Link>
                </li>
              ))}

              {/* Mobile user info card */}
              <li className="md:hidden mt-6 w-full animate-slideUp">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-blue-100 dark:border-gray-700">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">{user.fullName}</div>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                        {user.role === "admin" ? "Access Level: Admin" : "Family Member"}
                      </div>
                    </div>
                    {user.biometricEnabled && (
                       <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                        <i className="fas fa-fingerprint text-emerald-600"></i>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  )
}

export default Navbar