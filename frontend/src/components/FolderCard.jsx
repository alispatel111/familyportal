"use client"

import { useState } from "react"

const FolderCard = ({ folder, onEdit, onDelete, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(folder)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (
      window.confirm(`Are you sure you want to delete "${folder.name}"? All documents will be moved to "No Folder".`)
    ) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete(folder._id)
      }, 300)
    }
  }

  const handleOpen = () => {
    onOpen(folder)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all duration-500 cursor-pointer ${isHovered ? "shadow-xl -translate-y-1" : "shadow-md"} ${isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"} w-full h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
      style={{
        background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #faf5ff)",
        border: "1px solid rgba(229, 231, 235, 0.8)",
      }}
    >
      {/* Animated background effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, ${folder.color}20, ${folder.color}10)`,
          opacity: isHovered ? 1 : 0,
        }}
      ></div>

      {/* Floating particles animation */}
      {isHovered && (
        <>
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-70 animate-ping"
            style={{ backgroundColor: folder.color }}
          ></div>
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full opacity-70 animate-ping"
            style={{ backgroundColor: folder.color, animationDelay: "0.2s" }}
          ></div>
        </>
      )}

      <div className="relative flex flex-col h-full">
        <div className="flex items-start gap-3 flex-grow">
          {/* Folder icon with enhanced animation */}
          <div className="flex-shrink-0">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md transition-all duration-500 ${isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"}`}
              style={{
                backgroundColor: folder.color,
                boxShadow: isHovered
                  ? `0 8px 20px -5px ${folder.color}40, 0 4px 8px -5px ${folder.color}40`
                  : `0 4px 6px -1px ${folder.color}30, 0 2px 4px -1px ${folder.color}30`,
              }}
            >
              <i className="fas fa-folder text-lg"></i>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-800 transition-all duration-500 line-clamp-2 leading-tight">
              {folder.name}
            </h3>

            {folder.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{folder.description}</p>}

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <div className="inline-flex items-center gap-1">
                <i className="fas fa-file text-gray-500 text-xs"></i>
                <span>{folder.documentCount || 0} documents</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <i className="fas fa-calendar text-gray-500 text-xs"></i>
                {formatDate(folder.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created {formatDate(folder.createdAt)}</div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="group flex items-center justify-center rounded-lg p-2.5 text-white shadow-md transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: folder.color,
                boxShadow: `0 3px 5px -1px ${folder.color}40, 0 1px 3px -1px ${folder.color}40`,
              }}
              title="Edit folder"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
            <button
              onClick={handleDelete}
              className="group flex items-center justify-center rounded-lg p-2.5 text-white shadow-md transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              style={{
                background: "linear-gradient(to right, #EF4444, #DC2626)",
                boxShadow: "0 3px 5px -1px rgba(239, 68, 68, 0.4), 0 1px 3px -1px rgba(220, 38, 38, 0.4)",
              }}
              title="Delete folder"
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
          boxShadow: `0 0 0 2px ${folder.color}20 inset`,
        }}
      ></div>
    </div>
  )
}

export default FolderCard
