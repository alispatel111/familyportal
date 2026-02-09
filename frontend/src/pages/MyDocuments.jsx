"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import DocumentCard from "../components/DocumentCard"
// Modern Icons
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  FolderOpen, 
  Upload, 
  FileText, 
  Loader2, 
  X, 
  ChevronDown, 
  Trash2, 
  Folder,
  SlidersHorizontal,
  RefreshCw
} from "lucide-react"

const MyDocuments = () => {
  // ==============================
  // LOGIC & STATE (UNCHANGED)
  // ==============================
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

  // ==============================
  // MODERN UI RENDERING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-xl ring-1 ring-gray-100">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm animate-pulse tracking-wide">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
        
        {/* === HEADER SECTION === */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-10 shadow-2xl shadow-blue-900/20">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-inner">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  My Documents
                </h1>
                <p className="text-blue-100/90 text-sm md:text-base font-light max-w-lg">
                  Securely manage, organize, and access all your important files in one centralized dashboard.
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Total</span>
                  <span className="text-lg font-bold text-white leading-none">{documents.length}</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Visible</span>
                  <span className="text-lg font-bold text-white leading-none">{filteredDocuments.length}</span>
                </div>
              </div>

              <Link
                to="/folders"
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all duration-200 border border-white/10 font-medium active:scale-95"
              >
                <FolderOpen className="w-5 h-5" />
                <span>Folders</span>
              </Link>
              
              <Link
                to="/upload"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 font-bold active:scale-95"
              >
                <Upload className="w-5 h-5" />
                <span>Upload New</span>
              </Link>
            </div>
          </div>
        </div>

        {/* === CONTROLS & FILTERS === */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5 md:p-6 sticky top-4 z-30 backdrop-blur-xl bg-white/90">
          <div className="flex flex-col lg:flex-row gap-5">
            
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <div className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              )}
            </div>

            {/* View & Clear Controls */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === "list" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                  aria-label="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {(selectedCategory || selectedFolder || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100">
            {/* Category Filter */}
            <div className="relative group">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block pl-1">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category === "All" ? "" : category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Folder Filter */}
            <div className="relative group">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block pl-1">
                Folder
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Folder className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Folders</option>
                  <option value="no-folder">Unorganized (No Folder)</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === ACTIVE FILTERS INDICATOR === */}
        {(selectedFolder || selectedCategory || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in">
             <span className="text-sm font-medium text-slate-500 mr-2 flex items-center gap-2">
               <SlidersHorizontal className="w-4 h-4" />
               Active Filters:
             </span>
             {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("")} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                </span>
             )}
             {selectedFolder && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                  Folder: {getFolderName(selectedFolder)}
                  <button onClick={() => setSelectedFolder("")} className="hover:text-indigo-900"><X className="w-3 h-3"/></button>
                </span>
             )}
             {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-medium">
                  Search: "{searchTerm}"
                  <button onClick={clearSearch} className="hover:text-purple-900"><X className="w-3 h-3"/></button>
                </span>
             )}
          </div>
        )}

        {/* === DOCUMENT CONTENT === */}
        {filteredDocuments.length > 0 ? (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-3"
          }>
            {filteredDocuments.map((document, index) => (
              <div 
                key={document._id} 
                className="animate-slide-in" 
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both'
                }}
              >
                <DocumentCard
                  document={document}
                  onDelete={handleDeleteDocument}
                  onMove={handleMoveDocument}
                  folders={folders}
                  showUser={false}
                  listView={viewMode === "list"}
                />
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300 text-center animate-fade-in">
            <div className="relative mb-6 group cursor-default">
              <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative bg-white p-5 rounded-full shadow-sm ring-1 ring-blue-50">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">No documents found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
              {searchTerm || selectedCategory || selectedFolder
                ? "We couldn't find any documents matching your current filters. Try clearing them to see all files."
                : "You haven't uploaded any documents yet. Get started by adding your first file."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {searchTerm || selectedCategory || selectedFolder ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors font-medium shadow-lg shadow-slate-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters
                </button>
              ) : (
                <>
                  <Link
                    to="/upload"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Link>
                  <Link
                    to="/folders"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Manage Folders
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Animations Styles */}
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  )
}

export default MyDocuments