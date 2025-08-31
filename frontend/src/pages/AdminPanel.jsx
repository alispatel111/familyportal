"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const AdminPanel = () => {
  const [users, setUsers] = useState([])
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

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

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h1 className="text-balance text-2xl font-semibold text-gray-900">⚙️ Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">Manage users and documents across the family portal</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["overview", "users", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-brand text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab === "overview" && "Overview"}
            {tab === "users" && `Users (${users.length})`}
            {tab === "documents" && `All Documents (${documents.length})`}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalDocuments}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <i className="fas fa-tags"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <div className="text-2xl font-semibold text-gray-900">{stats.documentsByCategory?.length || 0}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Documents by Category</h3>
              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
                {stats.documentsByCategory?.map((category) => (
                  <div key={category._id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">{category._id}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div key={user._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="mb-2 text-base font-semibold text-gray-900">{user.fullName}</div>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {user.role}
                </span>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p>Documents: {documents.filter((doc) => doc.uploadedBy._id === user._id).length}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document._id} document={document} onDelete={handleDeleteDocument} showUser={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
