"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import FolderCard from "../components/FolderCard"
import FolderModal from "../components/FolderModal"

const Folders = () => {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchFolders()
  }, [])

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

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading folders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">My Folders</h1>
                    <p className="text-green-100 mt-2">Organize your documents into folders for better management</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-green-100">Total Folders</div>
                    <div className="font-semibold">{folders.length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-green-100">Documents</div>
                    <div className="font-semibold">
                      {folders.reduce((total, folder) => total + (folder.documentCount || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center gap-3 bg-white text-green-600 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Folder
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Sort by:</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/40">
          {folders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Folders Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first folder to organize your documents and make them easier to find and manage
              </p>
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Folder
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  All Folders ({filteredFolders.length})
                </h2>
                <p className="text-gray-600">Click on any folder to view its contents</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredFolders.map((folder, index) => (
                  <div key={folder._id} className="animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <FolderCard
                      folder={folder}
                      onEdit={handleEditFolder}
                      onDelete={handleDeleteFolder}
                      onOpen={handleOpenFolder}
                    />
                  </div>
                ))}
              </div>
              
              {searchQuery && filteredFolders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No folders found</h3>
                  <p className="text-gray-600">Try a different search term or create a new folder</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Documents</div>
                <div className="text-2xl font-bold text-gray-800">
                  {folders.reduce((total, folder) => total + (folder.documentCount || 0), 0)}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Storage Used</div>
                <div className="text-2xl font-bold text-gray-800">1.8 GB</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Recently Added</div>
                <div className="text-2xl font-bold text-gray-800">
                  {folders.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolder}
        folder={editingFolder}
      />

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
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Folders