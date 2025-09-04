"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import FolderCard from "../components/FolderCard"
import FolderModal from "../components/FolderModal"
import LoadingSpinner from "../components/LoadingSpinner"

const Folders = () => {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)

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
        // Update existing folder
        const response = await axios.put(`/api/folders/${editingFolder._id}`, folderData)
        setFolders((prev) => prev.map((folder) => (folder._id === editingFolder._id ? response.data.folder : folder)))
        if (window.showToast) {
          window.showToast("success", "Success", "Folder updated successfully")
        }
      } else {
        // Create new folder
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
    // Navigate to folder view - you can implement this based on your routing
    window.location.href = `/my-documents?folder=${folder._id}`
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Folders</h1>
          <p className="text-gray-600">Organize your documents into folders</p>
        </div>
        <button
          onClick={handleCreateFolder}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <i className="fas fa-plus"></i>
          Create Folder
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-folder text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No folders yet</h3>
          <p className="text-gray-600 mb-4">Create your first folder to organize your documents</p>
          <button
            onClick={handleCreateFolder}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <i className="fas fa-plus"></i>
            Create Your First Folder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <FolderCard
              key={folder._id}
              folder={folder}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
              onOpen={handleOpenFolder}
            />
          ))}
        </div>
      )}

      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolder}
        folder={editingFolder}
      />
    </div>
  )
}

export default Folders
