"use client"

import { useState } from "react"

const DocumentCard = ({ document, onDelete, onMove, folders = [], showUser = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false) // Added move menu state

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return "fas fa-file-pdf"
    if (mimeType?.includes("image")) return "fas fa-file-image"
    if (mimeType?.includes("document")) return "fas fa-file-word"
    return "fas fa-file"
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryStyle = (category) => {
    const styles = {
      "pan card": {
        bg: "linear-gradient(to right, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))",
        text: "text-red-700",
        icon: "fas fa-id-card",
        iconColor: "text-red-500",
      },
      insurance: {
        bg: "linear-gradient(to right, rgba(34, 197, 94, 0.15), rgba(101, 163, 13, 0.15))",
        text: "text-green-700",
        icon: "fas fa-shield-alt",
        iconColor: "text-green-500",
      },
      default: {
        bg: "linear-gradient(to right, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))",
        text: "text-indigo-700",
        icon: "fas fa-tag",
        iconColor: "text-indigo-500",
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
    <div
      className={`relative overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all duration-500 ${isHovered ? "shadow-xl -translate-y-1" : "shadow-md"} ${isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"} w-full h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #faf5ff)",
        border: "1px solid rgba(229, 231, 235, 0.8)",
      }}
    >
      {/* Animated background effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: "linear-gradient(to right, #818cf8, #06b6d4, #a855f7)",
          opacity: isHovered ? 0.05 : 0,
        }}
      ></div>

      {/* Floating particles animation */}
      {isHovered && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-400 opacity-70 animate-ping"></div>
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-cyan-400 opacity-70 animate-ping"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </>
      )}

      <div className="relative flex flex-col h-full">
        <div className="flex items-start gap-3 flex-grow">
          {/* File icon with enhanced animation */}
          <div className="flex-shrink-0">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md transition-all duration-500 ${isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"}`}
              style={{
                background: "linear-gradient(to right, #6366f1, #06b6d4)",
                boxShadow: isHovered
                  ? "0 8px 20px -5px rgba(99, 102, 241, 0.4), 0 4px 8px -5px rgba(6, 182, 212, 0.4)"
                  : "0 4px 6px -1px rgba(99, 102, 241, 0.3), 0 2px 4px -1px rgba(6, 182, 212, 0.3)",
              }}
            >
              <i className={`${getFileIcon(document.mimeType)} text-lg`}></i>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-800 transition-all duration-500 line-clamp-2 leading-tight">
              {document.originalName}
            </h3>

            <div
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-500"
              style={{ background: categoryStyle.bg }}
            >
              <i className={`${categoryStyle.icon} ${categoryStyle.iconColor} text-xs`}></i>
              <span className={categoryStyle.text}>{document.category || "Document"}</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-gray-600">
              {showUser && document.uploadedBy && (
                <div className="inline-flex items-center gap-1 transition-all duration-300 hover:text-gray-800">
                  <i className="fas fa-user text-gray-500 text-xs"></i>
                  <span className="truncate max-w-[80px]">{document.uploadedBy.fullName}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1 transition-all duration-300 hover:text-gray-800">
                <i className="fas fa-calendar text-gray-500 text-xs"></i>
                {formatDate(document.uploadDate)}
              </div>
              <div className="inline-flex items-center gap-1 transition-all duration-300 hover:text-gray-800">
                <i className="fas fa-weight-hanging text-gray-500 text-xs"></i>
                {formatFileSize(document.fileSize)}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal action buttons - positioned at bottom */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">{formatDate(document.uploadDate)}</div>

          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="group flex items-center justify-center rounded-lg p-2.5 text-white shadow-md transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{
                background: "linear-gradient(to right, #6366f1, #06b6d4)",
                boxShadow: "0 3px 5px -1px rgba(99, 102, 241, 0.4), 0 1px 3px -1px rgba(6, 182, 212, 0.4)",
              }}
              title="View document"
            >
              <i className="fas fa-eye text-sm"></i>
            </button>
            <button
              onClick={handleDownload}
              className="group flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
              title="Download document"
            >
              <i className="fas fa-download text-sm"></i>
            </button>

            {/* Move button - only show if folders exist and onMove is provided */}
            {onMove && folders.length > 0 && (
              <div className="relative">
                <button
                  onClick={toggleMoveMenu}
                  className="group flex items-center justify-center rounded-lg p-2.5 text-white shadow-md transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  style={{
                    background: "linear-gradient(to right, #10b981, #059669)",
                    boxShadow: "0 3px 5px -1px rgba(16, 185, 129, 0.4), 0 1px 3px -1px rgba(5, 150, 105, 0.4)",
                  }}
                  title="Move to folder"
                >
                  <i className="fas fa-folder-open text-sm"></i>
                </button>

                {/* Move menu dropdown */}
                {showMoveMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fadeIn">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 px-2 py-1 border-b border-gray-100">
                        Move to folder:
                      </div>
                      <button
                        onClick={() => handleMove(null)}
                        className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors duration-200"
                      >
                        📄 No Folder
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder._id}
                          onClick={() => handleMove(folder._id)}
                          className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors duration-200"
                        >
                          📁 {folder.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleDelete}
              className="group flex items-center justify-center rounded-lg p-2.5 text-white shadow-md transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              style={{
                background: "linear-gradient(to right, #EF4444, #DC2626)",
                boxShadow: "0 3px 5px -1px rgba(239, 68, 68, 0.4), 0 1px 3px -1px rgba(220, 38, 38, 0.4)",
              }}
              title="Delete document"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Animated border on hover */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-700"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2) inset",
        }}
      ></div>

      {/* Click outside to close move menu */}
      {showMoveMenu && <div className="fixed inset-0 z-5" onClick={() => setShowMoveMenu(false)}></div>}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default DocumentCard
