"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const MyDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const [searchParams] = useSearchParams()

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
    fetchFolders()
    fetchDocuments()

    const folderParam = searchParams.get("folder")
    if (folderParam) {
      setSelectedFolder(folderParam)
    }
  }, [searchParams])

  useEffect(() => {
    filterDocuments()
  }, [documents, selectedCategory, selectedFolder, searchTerm])

  const fetchFolders = async () => {
    try {
      const response = await axios.get("/api/folders")
      setFolders(response.data.folders)
    } catch (error) {
      console.error("❌ Error fetching folders:", error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/documents")
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

    if (selectedFolder === "no-folder") {
      filtered = filtered.filter((doc) => !doc.folderId)
    } else if (selectedFolder && selectedFolder !== "all") {
      filtered = filtered.filter((doc) => doc.folderId === selectedFolder)
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

  const handleMoveDocument = async (documentId, newFolderId) => {
    try {
      await axios.put(`/api/documents/${documentId}/move`, { folderId: newFolderId })

      setDocuments((prev) =>
        prev.map((doc) => (doc._id === documentId ? { ...doc, folderId: newFolderId || null } : doc)),
      )

      if (window.showToast) {
        window.showToast("success", "Document Moved", "Document has been moved successfully")
      }
    } catch (error) {
      console.error("Error moving document:", error)
      if (window.showToast) {
        window.showToast("error", "Move Failed", "Failed to move document")
      }
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedFolder("")
    setSearchTerm("")
  }

  const getFolderName = (folderId) => {
    if (!folderId) return "No Folder"
    if (folderId === "all") return "All Folders"
    if (folderId === "no-folder") return "No Folder"
    const folder = folders.find((f) => f._id === folderId)
    return folder ? folder.name : "Unknown Folder"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">My Documents</h1>
                    <p className="text-blue-100 mt-2">Manage and organize your uploaded documents securely</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-blue-100">Total Documents</div>
                    <div className="font-semibold">{documents.length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-blue-100">Filtered</div>
                    <div className="font-semibold">{filteredDocuments.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/folders"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Manage Folders
                </Link>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload New
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/40">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "grid" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "list" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category === "All" ? "" : category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Folder</label>
              <div className="relative">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Folders</option>
                  <option value="no-folder">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Showing {filteredDocuments.length} of {documents.length} documents
              </h3>
              {(selectedFolder || selectedCategory || searchTerm) && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {selectedCategory}
                    </span>
                  )}
                  {selectedFolder && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {getFolderName(selectedFolder)}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      "{searchTerm}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document, index) => (
                <div key={document._id} className="animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <DocumentCard
                    document={document}
                    onDelete={handleDeleteDocument}
                    onMove={handleMoveDocument}
                    folders={folders}
                    showUser={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document, index) => (
                <div key={document._id} className="animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <DocumentCard
                    document={document}
                    onDelete={handleDeleteDocument}
                    onMove={handleMoveDocument}
                    folders={folders}
                    showUser={false}
                    listView={true}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl shadow-2xl border border-gray-200">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Documents Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory || selectedFolder
                ? "No documents match your search criteria. Try adjusting your filters or search term."
                : "You haven't uploaded any documents yet. Start by uploading your first document."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm || selectedCategory || selectedFolder ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-900 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters
                </button>
              ) : (
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Your First Document
                </Link>
              )}
              <Link
                to="/folders"
                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Manage Folders
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
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
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default MyDocuments