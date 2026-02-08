"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const DocumentCard = ({ document, onDelete, onMove, folders = [], showUser = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return "📄"
    if (mimeType?.includes("image")) return "🖼️"
    if (mimeType?.includes("document") || mimeType?.includes("word")) return "📝"
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return "📊"
    if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return "📽️"
    return "📁"
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getCategoryStyle = (category) => {
    const styles = {
      "pan card": {
        bg: "from-red-50 to-orange-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "🆔",
      },
      insurance: {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "🛡️",
      },
      default: {
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "📁",
      },
    }

    const normalizedCategory = category?.toLowerCase() || ""
    return styles[normalizedCategory] || styles.default
  }

  const handleView = () => {
    if (!document.fileUrl) {
      console.error("❌ ERROR: document.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot view file.")
      }
      return
    }
    window.open(document.fileUrl, "_blank")
  }

  const handleDownload = () => {
    if (!document.fileUrl) {
      console.error("❌ ERROR: document.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot download file.")
      }
      return
    }

    const downloadUrl = `${document.fileUrl}?download=true`

    try {
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = document.originalName
      link.target = "_blank"
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (window.showToast) {
        window.showToast("success", "Download Started", `Downloading ${document.originalName}`)
      }
    } catch (error) {
      console.error("❌ Download failed:", error)
      if (window.showToast) {
        window.showToast("error", "Download Failed", "Unable to download file. Please try again.")
      }
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete(document._id)
      }, 300)
    }
  }

  const handleMove = (folderId) => {
    if (onMove) {
      onMove(document._id, folderId)
    }
    setShowMoveMenu(false)
  }

  const toggleMoveMenu = (e) => {
    e.stopPropagation()
    setShowMoveMenu(!showMoveMenu)
  }

  const categoryStyle = getCategoryStyle(document.category)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: isDeleting ? 0 : 1, 
        scale: isDeleting ? 0.9 : 1,
        y: 0 
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg transition-all duration-500 hover:shadow-2xl">
        {/* Background glow effect */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: isHovered ? 0.1 : 0,
            scale: isHovered ? 1 : 0.8 
          }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl"
        />

        {/* Main content */}
        <div className="relative p-6">
          {/* Header with icon and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${categoryStyle.bg} ${categoryStyle.border} shadow-lg`}
              >
                <span className="text-2xl">{getFileIcon(document.mimeType)}</span>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {document.originalName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(document.fileSize)} • {formatDate(document.uploadDate)}
                </p>
              </div>
            </div>

            {/* Quick action menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-gray-500">⋯</span>
              </button>

              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                >
                  <button
                    onClick={handleView}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <span>👁️</span>
                    <span>View Document</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <span>⬇️</span>
                    <span>Download</span>
                  </button>
                  {onMove && folders.length > 0 && (
                    <button
                      onClick={toggleMoveMenu}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <span>📂</span>
                      <span>Move to Folder</span>
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 rounded-b-xl"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Category badge */}
          <motion.div
            initial={false}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            className={`inline-flex items-center space-x-2 rounded-full px-4 py-2 ${categoryStyle.bg} ${categoryStyle.border} mb-4`}
          >
            <span className="text-sm">{categoryStyle.icon}</span>
            <span className={`text-sm font-semibold ${categoryStyle.text}`}>
              {document.category || "Document"}
            </span>
          </motion.div>

          {/* User info if enabled */}
          {showUser && document.uploadedBy && (
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-gray-50/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">
                {document.uploadedBy.fullName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{document.uploadedBy.fullName}</p>
                <p className="text-xs text-gray-500">Uploaded by</p>
              </div>
            </div>
          )}

          {/* File details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-gray-50/50 p-3">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="text-sm font-medium text-gray-800">
                {document.mimeType?.split('/')[1]?.toUpperCase() || "FILE"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50/50 p-3">
              <p className="text-xs text-gray-500 mb-1">Uploaded</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(document.uploadDate)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleView}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>👁️</span>
              <span>View</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>⬇️</span>
              <span>Download</span>
            </motion.button>
          </div>
        </div>

        {/* Move menu dropdown */}
        {showMoveMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-16 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
          >
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2 px-2">Move to folder:</p>
              <button
                onClick={() => handleMove(null)}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
              >
                <span>📄</span>
                <span>No Folder</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => handleMove(folder._id)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                >
                  <span>📁</span>
                  <span>{folder.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showActions || showMoveMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowActions(false)
            setShowMoveMenu(false)
          }}
        />
      )}

      {/* Animated border effect */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95 
        }}
        className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none"
        style={{
          background: "linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Floating particles on hover */}
      {isHovered && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-400 animate-ping"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-purple-400 animate-ping"
          />
        </>
      )}
    </motion.div>
  )
}

export default DocumentCard