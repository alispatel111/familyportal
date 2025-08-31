"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const Dashboard = ({ user }) => {
  const [recentDocuments, setRecentDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

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
    <div className="grid min-h-[80vh] place-items-center bg-gradient-to-br from-indigo-50 via-cyan-50 to-purple-50">
      <div className="flex flex-col items-center gap-5 p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 border border-white/20">
        {/* Main spinner with gradient and pulse effect */}
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-500 border-r-cyan-500 transition-all duration-500 hover:scale-110 hover:border-t-indigo-600 hover:border-r-cyan-600 shadow-md"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-indigo-200/40"></div>
          <div className="absolute inset-2 h-12 w-12 animate-pulse rounded-full bg-indigo-100/20"></div>
        </div>
        
        {/* Animated dots with sequential fade effect */}
        <p className="text-lg font-medium text-gray-700 flex items-center animate-pulse">
          <span className="tracking-wide">Loading your dashboard</span>
          <span className="flex ml-1">
            <span className="opacity-0 animate-[fade_1.5s_infinite]">.</span>
            <span className="opacity-0 animate-[fade_1.5s_infinite_0.2s]">.</span>
            <span className="opacity-0 animate-[fade_1.5s_infinite_0.4s]">.</span>
          </span>
        </p>
        
        {/* Subtle progress indicator */}
        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div className="h-full w-1/3 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-full animate-[slide_2s_infinite]"></div>
        </div>
      </div>
    </div>
  ) 
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-purple-50 p-6 animate-gradient">
      {/* Animated background elements */}
      <div className="fixed -left-40 -top-40 h-80 w-80 animate-float-slow rounded-full bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 blur-3xl"></div>
      <div className="fixed -right-40 bottom-0 h-80 w-80 animate-float-slower rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-3xl"></div>
      
      <div className="relative space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl animate-slide-in">
          <div className="absolute -right-6 -top-6 h-32 w-32 animate-pulse-slow rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10"></div>
          <div className="absolute -bottom-8 -left-6 h-28 w-28 animate-pulse-slower rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
              <span className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg">
                <i className="fas fa-home"></i>
              </span>
              Welcome back, {user.fullName}!
            </h1>
            <p className="mt-2 text-gray-600 animate-fade-in-delay">Manage your family documents securely and efficiently</p>
          </div>
        </div>

        {/* Stats Cards - Admin Only */}
        {user.role === "admin" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-stagger-children">
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -right-6 -top-6 h-20 w-20 animate-pulse-slow rounded-full bg-indigo-200/30 transition-all duration-700 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-indigo-600">
                  <i className="fas fa-users text-lg"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <div className="mt-1 text-2xl font-bold text-gray-900 animate-count-up">{stats.totalUsers || 0}</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -right-6 -top-6 h-20 w-20 animate-pulse-slow rounded-full bg-cyan-200/30 transition-all duration-700 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-cyan-600">
                  <i className="fas fa-file-alt text-lg"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
                <div className="mt-1 text-2xl font-bold text-gray-900 animate-count-up">{stats.totalDocuments || 0}</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -right-6 -top-6 h-20 w-20 animate-pulse-slow rounded-full bg-purple-200/30 transition-all duration-700 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-purple-600">
                  <i className="fas fa-tags text-lg"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <div className="mt-1 text-2xl font-bold text-gray-900 animate-count-up">{stats.documentsByCategory?.length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 animate-fade-in-up">
          <Link
            to="/upload"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            <span className="relative z-10 flex items-center">
              <i className="fas fa-cloud-upload-alt mr-2 transition-transform duration-300 group-hover:scale-110"></i>
              Upload Document
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          </Link>
          
          <Link
            to="/my-documents"
            className="group inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3.5 font-medium text-gray-700 shadow-md transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg"
          >
            <i className="fas fa-file-alt text-indigo-500 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-600"></i>
            View All Documents
          </Link>
          
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/40"
            >
              <span className="relative z-10 flex items-center">
                <i className="fas fa-cog mr-2 transition-transform duration-300 group-hover:rotate-90"></i>
                Admin Panel
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-gray-900 to-black opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-800 to-gray-900 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            </Link>
          )}
        </div>

        {/* Recent Documents Section */}
        <div className="overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl transition-all duration-500 hover:shadow-2xl">
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900 animate-fade-in">
            <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md">
              <i className="fas fa-clock"></i>
            </span>
            Recent Documents
          </h2>
          
          {recentDocuments.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-stagger-children">
              {recentDocuments.map((document, index) => (
                <div key={document._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <DocumentCard
                    document={document}
                    onDelete={handleDeleteDocument}
                    showUser={user.role === "admin"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center rounded-xl border-2 border-dashed border-gray-300 p-10 text-center transition-all duration-500 hover:border-indigo-300 hover:bg-indigo-50/50">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 text-3xl text-indigo-500 animate-bounce-slow">
                <i className="fas fa-folder-open"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Documents Yet</h3>
              <p className="mt-1 text-gray-500">Start by uploading your first document to get organized!</p>
              <Link
                to="/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-medium text-white shadow-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <i className="fas fa-plus"></i>
                Upload your first document
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes slide-in {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 15s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 8s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-delay { animation: fade-in 1s ease-out 0.3s both; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-count-up { animation: count-up 1s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
        .animate-stagger-children > * { animation: fade-in-up 0.6s ease-out; }
        .animate-stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}

export default Dashboard