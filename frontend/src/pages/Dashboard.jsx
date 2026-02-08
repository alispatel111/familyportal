"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const Dashboard = ({ user }) => {
  const [recentDocuments, setRecentDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [documentsRes, statsRes] = await Promise.all([
        axios.get("/api/documents?limit=5"),
        user.role === "admin" ? axios.get("/api/admin/stats") : Promise.resolve({ data: {} }),
      ])

      setRecentDocuments(documentsRes.data.documents.slice(0, 5))
      if (user.role === "admin") {
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      if (window.showToast) {
        window.showToast("error", "Error", "Failed to load dashboard data")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`)
      setRecentDocuments(recentDocuments.filter((doc) => doc._id !== documentId))

      if (window.showToast) {
        window.showToast("success", "Document Deleted", "Document has been successfully deleted")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      if (window.showToast) {
        window.showToast("error", "Delete Failed", "Failed to delete document")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user.fullName}! 👋</h1>
                    <p className="text-blue-100 mt-2">Manage your family documents securely and efficiently</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-blue-100">Role</div>
                    <div className="font-semibold capitalize">{user.role}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-blue-100">Documents</div>
                    <div className="font-semibold">{recentDocuments.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-sm text-blue-100 mb-2">Quick Actions</div>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Admin Only */}
        {user.role === "admin" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-in" style={{animationDelay: "0.1s"}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.204a9 9 0 01-13.5 0" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Active family members</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-in" style={{animationDelay: "0.2s"}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Documents</div>
                  <div className="text-3xl font-bold text-gray-800">{stats.totalDocuments || 0}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Uploaded files</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-in" style={{animationDelay: "0.3s"}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Categories</div>
                  <div className="text-3xl font-bold text-gray-800">{stats.documentsByCategory?.length || 0}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Document categories</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/40">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/upload"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Document</span>
            </Link>
            
            <Link
              to="/my-documents"
              className="group inline-flex items-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3.5 rounded-xl shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50"
            >
              <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View All Documents</span>
            </Link>
            
            <Link
              to="/folders"
              className="group inline-flex items-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3.5 rounded-xl shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 hover:border-green-300 hover:bg-green-50"
            >
              <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Manage Folders</span>
            </Link>
            
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="group inline-flex items-center gap-3 bg-gray-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Documents</h2>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Filter:</div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {["all", "pdf", "image", "document"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                      activeFilter === filter
                        ? "bg-white text-blue-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {filter === "all" ? "All" : 
                     filter === "pdf" ? "PDF" :
                     filter === "image" ? "Images" : "Documents"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {recentDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentDocuments
                .filter(doc => activeFilter === "all" || doc.type === activeFilter)
                .map((document, index) => (
                  <div key={document._id} className="animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <DocumentCard
                      document={document}
                      onDelete={handleDeleteDocument}
                      showUser={user.role === "admin"}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Documents Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by uploading your first document to organize your family's important files
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Your First Document
              </Link>
            </div>
          )}
          
          {recentDocuments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                to="/my-documents"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 group"
              >
                <span>View All Documents</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-sm text-gray-500 mb-2">Total Storage</div>
            <div className="text-2xl font-bold text-gray-800">2.4 GB</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: "65%"}}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-sm text-gray-500 mb-2">Shared Documents</div>
            <div className="text-2xl font-bold text-gray-800">14</div>
            <div className="text-sm text-gray-600 mt-1">With family members</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-sm text-gray-500 mb-2">Recent Activity</div>
            <div className="text-2xl font-bold text-gray-800">8</div>
            <div className="text-sm text-gray-600 mt-1">Last 24 hours</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-sm text-gray-500 mb-2">Folders</div>
            <div className="text-2xl font-bold text-gray-800">6</div>
            <Link to="/folders" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
              Manage folders →
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default Dashboard