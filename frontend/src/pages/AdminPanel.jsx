"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Search, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  File,
  Folder,
  Bell,
  HelpCircle,
  LogOut,
  BarChart3,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Shield,
  TrendingUp,
  X
} from "lucide-react"

const AdminPanel = () => {
  const [users, setUsers] = useState([])
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    fetchAdminData()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024)
  }

  const fetchAdminData = async () => {
    try {
      const [usersRes, documentsRes, statsRes] = await Promise.all([
        axios.get("/api/admin/users"),
        axios.get("/api/documents"),
        axios.get("/api/admin/stats"),
      ])
      setUsers(usersRes.data.users)
      setDocuments(documentsRes.data.documents)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`)
      setDocuments(documents.filter((doc) => doc._id !== documentId))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, count: null },
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "documents", label: "Documents", icon: FileText, count: documents.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          sidebarOpen || !isMobile ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
        } lg:translate-x-0 lg:w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Family Portal</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (isMobile) setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Settings Section */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Settings</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Help & Support</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-0'
      } ${!isMobile ? 'lg:ml-64' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div className="hidden lg:flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Admin Panel</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 capitalize">{activeTab}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="hidden md:flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Admin</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                  <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your portal today.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative md:hidden">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {sidebarItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {activeTab === "overview" && (
                <>
                  {/* Stats Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Users Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Users</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>12% increase</span>
                      </div>
                    </div>

                    {/* Total Documents Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Documents</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments || 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>24% increase</span>
                      </div>
                    </div>

                    {/* Categories Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                          <Folder className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Categories</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.documentsByCategory?.length || 0}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Active document categories</div>
                    </div>
                  </div>

                  {/* Documents by Category */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Documents by Category</h3>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stats.documentsByCategory?.map((category, index) => (
                        <div key={category._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{category._id.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{category._id}</span>
                              <p className="text-sm text-gray-500">Document category</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-sm">
                              {category.count} docs
                            </span>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {documents.slice(0, 3).map((doc, index) => (
                        <div key={doc._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <File className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              <p className="text-sm text-gray-500">Uploaded by {doc.uploadedBy?.fullName || 'User'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "users" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                          <Filter className="w-4 h-4" />
                          Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl transition-opacity">
                          <User className="w-4 h-4" />
                          Add User
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Cards View */}
                  <div className="lg:hidden p-6 space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            Documents: <span className="font-semibold text-gray-900">
                              {documents.filter((doc) => doc.uploadedBy._id === user._id).length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">User</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Role</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Email</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Joined</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Documents</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                  {user.fullName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">{user.email}</td>
                            <td className="p-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className="font-semibold text-gray-900">
                                {documents.filter((doc) => doc.uploadedBy._id === user._id).length}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6">
                  {/* Documents Header */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Documents ({filteredDocuments.length})</h3>
                        <p className="text-gray-600 mt-1">Manage all uploaded documents across the family portal</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                          <Filter className="w-4 h-4" />
                          Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl transition-opacity">
                          <File className="w-4 h-4" />
                          Upload New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDocuments.map((document) => (
                      <DocumentCard key={document._id} document={document} onDelete={handleDeleteDocument} showUser={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPanel