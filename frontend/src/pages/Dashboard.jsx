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
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`)
      setRecentDocuments(recentDocuments.filter((doc) => doc._id !== documentId))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.fullName}!</h1>
        <p>Manage your family documents securely</p>
      </div>

      {user.role === "admin" && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-number">{stats.totalUsers || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Documents</h3>
            <div className="stat-number">{stats.totalDocuments || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Categories</h3>
            <div className="stat-number">{stats.documentsByCategory?.length || 0}</div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <Link to="/upload" className="btn btn-primary">
          📤 Upload Document
        </Link>
        <Link to="/my-documents" className="btn btn-outline">
          📋 View All Documents
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className="btn btn-secondary">
            ⚙️ Admin Panel
          </Link>
        )}
      </div>

      <div className="recent-documents">
        <h2>Recent Documents</h2>
        {recentDocuments.length > 0 ? (
          <div className="documents-grid">
            {recentDocuments.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onDelete={handleDeleteDocument}
                showUser={user.role === "admin"}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
            <Link to="/upload" className="btn btn-primary">
              Upload your first document
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
