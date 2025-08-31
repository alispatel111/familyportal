"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const MyDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category === "All" ? "" : category)
    setIsDropdownOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Enhanced Spinner with Dual-ring Animation */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-brand border-r-brand animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent rounded-full border-b-brand border-l-brand animate-spin-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-file text-brand text-xl"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm transition-all duration-300 hover:scale-110">
            <i className="fas fa-file-alt text-2xl text-brand"></i>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Documents
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and organize your uploaded documents securely
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2 transition-all duration-300 hover:shadow-lg">
        <div className="space-y-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            <i className="fas fa-search mr-2 text-gray-400"></i>
            Search Documents
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors duration-200"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <i className="fas fa-filter mr-2 text-gray-400"></i>
            Filter by Category
          </label>
          <div className="relative">
            {/* Custom Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-900 outline-none transition-all duration-300 flex items-center justify-between hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <span>{selectedCategory || "All Categories"}</span>
              <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} text-sm transition-transform duration-300`}></i>
            </button>
            
            {/* Custom Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-dropdownFade">
                {categories.map((category) => (
                  <div
                    key={category}
                    onClick={() => selectCategory(category)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:pl-6 ${
                      (selectedCategory === category || (!selectedCategory && category === "All")) 
                        ? "bg-brand/10 text-brand font-medium" 
                        : "text-gray-700"
                    }`}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
        <i className="fas fa-chart-pie mr-2 text-brand"></i>
        Showing <span className="font-semibold mx-1">{filteredDocuments.length}</span> of{" "}
        <span className="font-semibold mx-1">{documents.length}</span> documents
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard 
              key={document._id} 
              document={document} 
              onDelete={handleDeleteDocument} 
              showUser={false} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-12 text-center transition-all duration-300 hover:border-brand/50 hover:bg-blue-50/50">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 transition-all duration-300 hover:scale-110">
            <i className="fas fa-search text-3xl text-brand"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || selectedCategory
              ? "No documents match your search criteria. Try adjusting your filters."
              : "You haven't uploaded any documents yet. Start by uploading your first document."}
          </p>
          {!searchTerm && !selectedCategory && (
            <Link
              to="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-hover hover:shadow-lg hover:-translate-y-0.5"
            >
              <i className="fas fa-plus"></i>
              Upload your first document
            </Link>
          )}
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-dropdownFade {
          animation: dropdownFade 0.2s ease-out;
        }
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.2s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default MyDocuments