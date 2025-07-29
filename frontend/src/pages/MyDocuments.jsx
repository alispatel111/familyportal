"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"
import "../styles/documents.css"
import "../styles/buttons.css"
import "../styles/forms.css"

const MyDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    "All",
    "Aadhaar Card",
    "PAN Card",
    "Passport",
    "Driving License",
    "Medical Records",
    "Insurance",
    "Bank Statements",
    "Property Documents",
    "Educational Certificates",
    "Other",
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, selectedCategory, searchTerm])

  const fetchDocuments = async () => {
    try {
      console.log("=== FETCHING MY DOCUMENTS ===")
      const response = await axios.get("/api/documents")
      console.log("📊 API Response:", response.data)
      console.log("📄 Documents received:", response.data.documents.length)

      setDocuments(response.data.documents)
    } catch (error) {
      console.error("❌ Error fetching documents:", error)
      if (window.showToast) {
        window.showToast("error", "Error", "Failed to load documents")
      }
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`)
      setDocuments(documents.filter((doc) => doc._id !== documentId))

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

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="my-documents">
      <div className="documents-header">
        <h1>
          <i className="fas fa-file-alt"></i>
          My Documents
        </h1>
        <p>Manage and organize your uploaded documents</p>
      </div>

      <div className="documents-filters">
        <div className="filter-group">
          <label htmlFor="search">
            <i className="fas fa-search"></i>
            Search Documents
          </label>
          <div className="search-input">
            <input
              id="search"
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
            <i className="fas fa-search search-icon"></i>
            {searchTerm && <i className="fas fa-times clear-icon" onClick={clearSearch}></i>}
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="category">
            <i className="fas fa-filter"></i>
            Filter by Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map((category) => (
              <option key={category} value={category === "All" ? "" : category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="documents-stats">
        <p>
          <i className="fas fa-chart-bar"></i>
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="documents-grid">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document._id} document={document} onDelete={handleDeleteDocument} showUser={false} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <h3>No Documents Found</h3>
          <p>
            {searchTerm || selectedCategory
              ? "No documents match your search criteria. Try adjusting your filters."
              : "You haven't uploaded any documents yet."}
          </p>
          {!searchTerm && !selectedCategory && (
            <Link to="/upload" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Upload your first document
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default MyDocuments
