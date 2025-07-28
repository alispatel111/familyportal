"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

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

      // Log each document
      response.data.documents.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`, {
          id: doc._id,
          name: doc.originalName,
          url: doc.fileUrl,
          category: doc.category,
          mimeType: doc.mimeType,
        })
      })

      setDocuments(response.data.documents)
    } catch (error) {
      console.error("❌ Error fetching documents:", error)
      console.error("Error response:", error.response?.data)
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
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  if (loading) {
    return <div className="loading">Loading documents...</div>
  }

  return (
    <div className="my-documents">
      <div className="documents-header">
        <h1>📋 My Documents</h1>
        <p>Manage and organize your uploaded documents</p>
      </div>

      <div className="documents-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
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
          <p>No documents found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default MyDocuments
