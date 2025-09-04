"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"

const MyDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [folders, setFolders] = useState([]) // Added folders state
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("") // Added folder filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false) // Added folder dropdown state
  const [searchParams] = useSearchParams() // Added URL params support

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

      // Update local state
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleFolderDropdown = () => {
    setIsFolderDropdownOpen(!isFolderDropdownOpen)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category === "All" ? "" : category)
    setIsDropdownOpen(false)
  }

  const selectFolder = (folderId) => {
    setSelectedFolder(folderId === "all" ? "" : folderId)
    setIsFolderDropdownOpen(false)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm transition-all duration-300 hover:scale-110">
              <i className="fas fa-file-alt text-2xl text-brand"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Documents</h1>
              <p className="mt-1 text-sm text-gray-600">Manage and organize your uploaded documents securely</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/folders"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <i className="fas fa-folder"></i>
              Manage Folders
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-all duration-200"
            >
              <i className="fas fa-plus"></i>
              Upload
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-card md:grid-cols-3 transition-all duration-300 hover:shadow-lg">
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
            <i className="fas fa-folder mr-2 text-gray-400"></i>
            Filter by Folder
          </label>
          <div className="relative">
            <button
              onClick={toggleFolderDropdown}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-900 outline-none transition-all duration-300 flex items-center justify-between hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <span>{getFolderName(selectedFolder) || "All Folders"}</span>
              <i
                className={`fas fa-chevron-${isFolderDropdownOpen ? "up" : "down"} text-sm transition-transform duration-300`}
              ></i>
            </button>

            {isFolderDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-dropdownFade">
                <div
                  onClick={() => selectFolder("all")}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:pl-6 ${
                    !selectedFolder ? "bg-brand/10 text-brand font-medium" : "text-gray-700"
                  }`}
                >
                  📁 All Folders
                </div>
                <div
                  onClick={() => selectFolder("no-folder")}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:pl-6 ${
                    selectedFolder === "no-folder" ? "bg-brand/10 text-brand font-medium" : "text-gray-700"
                  }`}
                >
                  📄 No Folder
                </div>
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    onClick={() => selectFolder(folder._id)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:pl-6 ${
                      selectedFolder === folder._id ? "bg-brand/10 text-brand font-medium" : "text-gray-700"
                    }`}
                  >
                    📁 {folder.name}
                  </div>
                ))}
              </div>
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
              <i
                className={`fas fa-chevron-${isDropdownOpen ? "up" : "down"} text-sm transition-transform duration-300`}
              ></i>
            </button>

            {/* Custom Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-dropdownFade">
                {categories.map((category) => (
                  <div
                    key={category}
                    onClick={() => selectCategory(category)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:pl-6 ${
                      selectedCategory === category || (!selectedCategory && category === "All")
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
        {(selectedFolder || selectedCategory) && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {selectedFolder && selectedFolder !== "all" && `📁 ${getFolderName(selectedFolder)}`}
            {selectedFolder && selectedCategory && " • "}
            {selectedCategory && `🏷️ ${selectedCategory}`}
          </span>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={handleDeleteDocument}
              onMove={handleMoveDocument} // Added move handler
              folders={folders} // Pass folders for move functionality
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
            {searchTerm || selectedCategory || selectedFolder
              ? "No documents match your search criteria. Try adjusting your filters."
              : "You haven't uploaded any documents yet. Start by uploading your first document."}
          </p>
          {!searchTerm && !selectedCategory && !selectedFolder && (
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
