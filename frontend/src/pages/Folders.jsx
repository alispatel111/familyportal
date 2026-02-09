"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import FolderCard from "../components/FolderCard"
import FolderModal from "../components/FolderModal"
// Importing modern icons from Lucide React
import { 
  Search, 
  Plus, 
  Folder, 
  FileText, 
  HardDrive, 
  Clock, 
  Loader2, 
  Filter, 
  LayoutGrid,
  ChevronDown
} from "lucide-react"

const Folders = () => {
  // --- STATE MANAGEMENT (LOGIC UNCHANGED) ---
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // --- EFFECTS (LOGIC UNCHANGED) ---
  useEffect(() => {
    fetchFolders()
  }, [])

  // --- API HANDLERS (LOGIC UNCHANGED) ---
  const fetchFolders = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/folders")
      setFolders(response.data.folders)
    } catch (error) {
      console.error("Error fetching folders:", error)
      if (window.showToast) {
        window.showToast("error", "Error", "Failed to load folders")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setIsModalOpen(true)
  }

  const handleEditFolder = (folder) => {
    setEditingFolder(folder)
    setIsModalOpen(true)
  }

  const handleSaveFolder = async (folderData) => {
    try {
      if (editingFolder) {
        const response = await axios.put(`/api/folders/${editingFolder._id}`, folderData)
        setFolders((prev) => prev.map((folder) => (folder._id === editingFolder._id ? response.data.folder : folder)))
        if (window.showToast) {
          window.showToast("success", "Success", "Folder updated successfully")
        }
      } else {
        const response = await axios.post("/api/folders", folderData)
        setFolders((prev) => [response.data.folder, ...prev])
        if (window.showToast) {
          window.showToast("success", "Success", "Folder created successfully")
        }
      }
    } catch (error) {
      console.error("Error saving folder:", error)
      const message = error.response?.data?.message || "Failed to save folder"
      if (window.showToast) {
        window.showToast("error", "Error", message)
      }
      throw error
    }
  }

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`/api/folders/${folderId}`)
      setFolders((prev) => prev.filter((folder) => folder._id !== folderId))
      if (window.showToast) {
        window.showToast("success", "Success", "Folder deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting folder:", error)
      const message = error.response?.data?.message || "Failed to delete folder"
      if (window.showToast) {
        window.showToast("error", "Error", message)
      }
    }
  }

  const handleOpenFolder = (folder) => {
    window.location.href = `/my-documents?folder=${folder._id}`
  }

  // --- FILTER & SORT LOGIC (LOGIC UNCHANGED) ---
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium text-lg">Loading your workspace...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    )
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">
        
        {/* --- HERO / HEADER SECTION --- */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden text-white group">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-24 group-hover:translate-x-20 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl translate-y-20 -translate-x-20 group-hover:-translate-x-16 transition-transform duration-1000"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-inner">
                  <Folder className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
                    My Folders
                  </h1>
                  <p className="text-blue-100 text-lg font-light">
                    Manage and organize your documents efficiently.
                  </p>
                </div>
              </div>

              {/* Header Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <Folder className="w-5 h-5 text-blue-200" />
                  <div>
                    <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Total</span>
                    <div className="text-xl font-bold">{folders.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <FileText className="w-5 h-5 text-blue-200" />
                  <div>
                    <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Docs</span>
                    <div className="text-xl font-bold">
                      {folders.reduce((total, folder) => total + (folder.documentCount || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateFolder}
              className="flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-[1.02] hover:bg-blue-50 active:scale-[0.98] transition-all duration-300 group/btn"
            >
              <div className="bg-blue-100 p-1.5 rounded-lg group-hover/btn:bg-blue-200 transition-colors">
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-lg">Create New Folder</span>
            </button>
          </div>
        </div>

        {/* --- STATS OVERVIEW CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total Documents</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {folders.reduce((total, folder) => total + (folder.documentCount || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Storage Used</p>
                <h3 className="text-3xl font-bold text-slate-800">1.8 GB</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Recently Added</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {folders.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTROLS BAR (SEARCH & FILTER) --- */}
        <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-lg shadow-slate-200/50 sticky top-4 z-20 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* View & Sort Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full md:w-auto hover:border-blue-300 transition-colors cursor-pointer">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 whitespace-nowrap">Sort by:</span>
                <div className="relative flex-grow md:flex-grow-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent border-none text-slate-900 text-sm font-semibold focus:ring-0 cursor-pointer pr-6 w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID CONTENT SECTION --- */}
        <div className="min-h-[400px]">
          {folders.length === 0 ? (
            /* EMPTY STATE 1: No folders at all */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                <LayoutGrid className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Folders Yet</h3>
              <p className="text-slate-500 text-center max-w-md mb-8">
                Your workspace is looking a bit empty. Create your first folder to start organizing your documents.
              </p>
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Create First Folder
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  All Folders 
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg border border-slate-200">
                    {filteredFolders.length}
                  </span>
                </h2>
              </div>

              {filteredFolders.length > 0 ? (
                /* GRID OF FOLDERS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFolders.map((folder, index) => (
                    <div 
                      key={folder._id} 
                      className="animate-fade-in-up" 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <FolderCard
                        folder={folder}
                        onEdit={handleEditFolder}
                        onDelete={handleDeleteFolder}
                        onOpen={handleOpenFolder}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE 2: Search yielded no results */
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No folders found</h3>
                  <p className="text-slate-500">
                    We couldn't find any folders matching "{searchQuery}"
                  </p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolder}
        folder={editingFolder}
      />

      {/* --- GLOBAL STYLES & ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default Folders