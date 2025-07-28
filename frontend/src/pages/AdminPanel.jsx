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
    return <div className="loading">Loading admin panel...</div>
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage users and documents across the family portal</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "overview" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "users" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          className={activeTab === "documents" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("documents")}
        >
          All Documents ({documents.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.totalUsers}</div>
              </div>
              <div className="stat-card">
                <h3>Total Documents</h3>
                <div className="stat-number">{stats.totalDocuments}</div>
              </div>
              <div className="stat-card">
                <h3>Categories</h3>
                <div className="stat-number">{stats.documentsByCategory?.length || 0}</div>
              </div>
            </div>

            <div className="category-breakdown">
              <h3>Documents by Category</h3>
              <div className="category-list">
                {stats.documentsByCategory?.map((category) => (
                  <div key={category._id} className="category-item">
                    <span className="category-name">{category._id}</span>
                    <span className="category-count">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-tab">
            <div className="users-grid">
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-info">
                    <h3>{user.fullName}</h3>
                    <p>@{user.username}</p>
                    <p>{user.email}</p>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="user-stats">
                    <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p>Documents: {documents.filter((doc) => doc.uploadedBy._id === user._id).length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="documents-tab">
            <div className="documents-grid">
              {documents.map((document) => (
                <DocumentCard key={document._id} document={document} onDelete={handleDeleteDocument} showUser={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
