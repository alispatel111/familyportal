"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"
import {
  Home,
  Upload,
  FileText,
  Folder,
  Settings,
  Users,
  FolderOpen,
  Activity,
  Database,
  Tag,
  ChevronRight,
  Plus,
  Shield,
  Lock,
  BarChart3,
  Calendar,
  TrendingUp,
  Zap,
  Bell,
  Award,
  Cpu,
  CheckCircle,
  Cloud,
  ShieldCheck,
  Filter // Added missing import
} from "lucide-react"

const Dashboard = ({ user }) => {
  const [recentDocuments, setRecentDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [hoveredCard, setHoveredCard] = useState(null)

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        {/* Background Soft Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center">
          {/* MST GOL GOL SPINNER DESIGN */}
          <div className="relative w-24 h-24 mb-10">
            {/* 1. Outer Ring - Slowest & Thinnest */}
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-blue-400 animate-[spin_3s_linear_infinite]"></div>
            
            {/* 2. Middle Ring - Faster & Opposite Direction */}
            <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-indigo-500 border-l-indigo-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
            
            {/* 3. Inner Glowing Core - Pulses & Spins */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Orbiting Dot - Extra Premium Touch */}
            <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
            </div>
          </div>

          {/* Simple & Clean Text */}
          <div className="text-center">
            <h3 className="text-slate-800 text-xl font-semibold tracking-tight">
              Loading your dashboard...
            </h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Fetching your secure files
            </p>
          </div>
        </div>

        {/* Global Animation for Smoothness */}
        <style jsx>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header with Enhanced Effects */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-4xl p-6 md:p-6 text-white group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700 delay-100"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-18 h-18 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Home className="w-9 h-9" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Welcome back, {user.fullName}! <span className="inline-block group-hover:animate-wave">👋</span>
                  </h1>
                  <p className="text-blue-100/90 text-lg">Manage your family documents with confidence</p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group-hover:bg-white/15 transition-all duration-300">
                  <div className="text-sm text-blue-100/80 mb-3 font-medium">Quick Actions</div>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-3 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group/btn"
                  >
                    <Upload className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                    <span>Upload Now</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 group/card hover:bg-white/15 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <div>
                    <div className="text-xs text-blue-100/80">Role</div>
                    <div className="font-semibold capitalize text-lg">{user.role}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 group/card hover:bg-white/15 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-200" />
                  <div>
                    <div className="text-xs text-blue-100/80">Documents</div>
                    <div className="font-semibold text-lg">{recentDocuments.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 group/card hover:bg-white/15 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <div>
                    <div className="text-xs text-blue-100/80">Status</div>
                    <div className="font-semibold text-lg text-green-300">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Admin Only with Enhanced Effects */}
        {user.role === "admin" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div 
              className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              onMouseEnter={() => setHoveredCard('users')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Users</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Active family members</span>
                </div>
              </div>
            </div>

            <div 
              className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              onMouseEnter={() => setHoveredCard('documents')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Documents</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalDocuments || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>Uploaded files</span>
                </div>
              </div>
            </div>

            <div 
              className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              onMouseEnter={() => setHoveredCard('categories')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Tag className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Categories</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.documentsByCategory?.length || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Cpu className="w-4 h-4 text-green-500" />
                  <span>Document categories</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/80 overflow-hidden group hover:shadow-2xl transition-all duration-500">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/upload"
                className="group/action relative bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover/action:scale-110 transition-transform duration-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span>Upload Document</span>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0 translate-x-4 transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link
                to="/my-documents"
                className="group/action relative bg-white border border-gray-200 text-gray-700 font-medium px-6 py-4 rounded-xl shadow hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover/action:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>View All Documents</span>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0 translate-x-4 transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
              </Link>
              
              <Link
                to="/folders"
                className="group/action relative bg-white border border-gray-200 text-gray-700 font-medium px-6 py-4 rounded-xl shadow hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:border-green-300 hover:bg-green-50/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg group-hover/action:scale-110 transition-transform duration-300">
                    <FolderOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Manage Folders</span>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0 translate-x-4 transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-green-600" />
                </div>
              </Link>
              
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="group/action relative bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg group-hover/action:rotate-12 transition-transform duration-300">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span>Admin Panel</span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0 translate-x-4 transition-all duration-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Documents Section - Enhanced */}
          <div className="lg:col-span-2 relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-gray-200/80 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Recent Documents</h2>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-100/50 backdrop-blur-sm rounded-xl p-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {["all", "pdf", "image", "document"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                          activeFilter === filter
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
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
                <div className="grid gap-4 md:grid-cols-2">
                  {recentDocuments
                    .filter(doc => activeFilter === "all" || doc.type === activeFilter)
                    .map((document, index) => (
                      <div 
                        key={document._id} 
                        className="transform hover:-translate-y-1 transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
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
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No Documents Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start by uploading your first document to organize your family's important files
                  </p>
                  <Link
                    to="/upload"
                    className="group/upload inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover/upload:rotate-90 transition-transform duration-300">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span>Upload Your First Document</span>
                  </Link>
                </div>
              )}
              
              {recentDocuments.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <Link
                    to="/my-documents"
                    className="group/viewall inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all duration-300"
                  >
                    <span>View All Documents</span>
                    <ChevronRight className="w-4 h-4 transform group-hover/viewall:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar Stats */}
          <div className="space-y-6">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/80 overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Quick Stats</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="group/stat transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-500" />
                        <div className="font-medium text-gray-900">Storage Usage</div>
                      </div>
                      <div className="text-lg font-bold text-gray-800">2.4 GB</div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-700" style={{width: "65%"}}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full translate-x-full group-hover/stat:translate-x-0 transition-transform duration-1000"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 group/stat hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Folder className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900">Shared</div>
                          <div className="text-2xl font-bold text-gray-800">14</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Documents shared</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 group/stat hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Activity</div>
                          <div className="text-2xl font-bold text-gray-800">8</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Last 24 hours</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 group/stat hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">Folders</div>
                          <div className="text-2xl font-bold text-gray-800">6</div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Organized storage</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to="/analytics"
                    className="group/analytics inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>View detailed analytics</span>
                    <ChevronRight className="w-4 h-4 transform group-hover/analytics:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Security Status */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-xl p-6 border border-green-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-green-200 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Security Status</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between group/status transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">100%</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between group/status transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">Secure Sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">Enabled</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between group/status transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">Last Backup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Today</span>
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between group/status transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">0 Active</span>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .group:hover .group-hover\\:animate-wave {
          animation: wave 0.5s ease-in-out;
        }
        
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
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  )
}

export default Dashboard