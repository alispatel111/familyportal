"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"
import "../styles/dashboard.css"
import "../styles/buttons.css"
import "../styles/cards.css"

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
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="welcome-animation">
          <i className="fas fa-home"></i>
          Welcome back, {user.fullName}!
        </h1>
        <p>Manage your family documents securely and efficiently</p>
      </div>

      {user.role === "admin" && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Total Users</h3>
            <div className="stat-number">{stats.totalUsers || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>Total Documents</h3>
            <div className="stat-number">{stats.totalDocuments || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-tags"></i>
            </div>
            <h3>Categories</h3>
            <div className="stat-number">{stats.documentsByCategory?.length || 0}</div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <Link to="/upload" className="btn btn-primary btn-lg">
          <i className="fas fa-cloud-upload-alt"></i>
          Upload Document
        </Link>
        <Link to="/my-documents" className="btn btn-secondary btn-lg">
          <i className="fas fa-file-alt"></i>
          View All Documents
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className="btn btn-outline btn-lg">
            <i className="fas fa-cog"></i>
            Admin Panel
          </Link>
        )}
      </div>

      <div className="recent-documents">
        <h2>
          <i className="fas fa-clock"></i>
          Recent Documents
        </h2>
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
            <i className="fas fa-folder-open"></i>
            <h3>No Documents Yet</h3>
            <p>Start by uploading your first document to get organized!</p>
            <Link to="/upload" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Upload your first document
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
