"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Presentation, 
  File, 
  MoreVertical, 
  Eye, 
  Download, 
  Trash2, 
  Shield, 
  CreditCard, 
  Folder, 
  User, 
  Calendar, 
  HardDrive
} from "lucide-react"

const DocumentCard = ({ document: doc, onDelete, showUser = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const menuRef = useRef(null)
  const actionsButtonRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          actionsButtonRef.current && !actionsButtonRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Helper to map mime types to Lucide Icons
  const getFileIcon = (mimeType) => {
    const props = { size: 28, strokeWidth: 1.5 }
    if (mimeType?.includes("pdf")) return <FileText {...props} className="text-red-500" />
    if (mimeType?.includes("image")) return <ImageIcon {...props} className="text-blue-500" />
    if (mimeType?.includes("document") || mimeType?.includes("word")) return <FileText {...props} className="text-blue-600" />
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return <FileSpreadsheet {...props} className="text-green-600" />
    if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return <Presentation {...props} className="text-orange-500" />
    return <File {...props} className="text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getCategoryStyle = (category) => {
    const styles = {
      "pan card": {
        bg: "bg-red-50",
        border: "border-red-100",
        text: "text-red-700",
        icon: <CreditCard size={14} className="text-red-600" />,
      },
      insurance: {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-700",
        icon: <Shield size={14} className="text-emerald-600" />,
      },
      "tax document": {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-700",
        icon: <FileText size={14} className="text-amber-600" />,
      },
      "bank statement": {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-700",
        icon: <CreditCard size={14} className="text-blue-600" />,
      },
      "personal": {
        bg: "bg-purple-50",
        border: "border-purple-100",
        text: "text-purple-700",
        icon: <User size={14} className="text-purple-600" />,
      },
      "work": {
        bg: "bg-cyan-50",
        border: "border-cyan-100",
        text: "text-cyan-700",
        icon: <FileText size={14} className="text-cyan-600" />,
      },
      default: {
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        text: "text-indigo-700",
        icon: <Folder size={14} className="text-indigo-600" />,
      },
    }

    const normalizedCategory = category?.toLowerCase() || ""
    return styles[normalizedCategory] || styles.default
  }

  const handleView = () => {
    if (!doc.fileUrl) {
      console.error("❌ ERROR: doc.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot view file.")
      }
      return
    }
    window.open(doc.fileUrl, "_blank")
  }

  const handleDownload = () => {
    if (!doc.fileUrl) {
      console.error("❌ ERROR: doc.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot download file.")
      }
      return
    }

    const downloadUrl = `${doc.fileUrl}?download=true`

    try {
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = doc.originalName
      link.target = "_blank"
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (window.showToast) {
        window.showToast("success", "Download Started", `Downloading ${doc.originalName}`)
      }
    } catch (error) {
      console.error("❌ Download failed:", error)
      if (window.showToast) {
        window.showToast("error", "Download Failed", "Unable to download file. Please try again.")
      }
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${doc.originalName}"?`)) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete(doc._id)
      }, 300)
    }
    setShowActions(false)
  }

  const categoryStyle = getCategoryStyle(doc.category)

  // File extension for badge
  const fileExtension = doc.mimeType?.split('/')[1]?.toUpperCase().substring(0, 4) || "FILE"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ 
        opacity: isDeleting ? 0 : 1, 
        scale: isDeleting ? 0.95 : 1,
        y: 0,
        filter: isDeleting ? "blur(4px)" : "blur(0px)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group h-full w-full"
    >
      {/* Main Card Container */}
      <div 
        className={`
          relative flex flex-col h-full bg-white rounded-2xl border transition-all duration-300 ease-out overflow-visible
          ${isHovered ? 'border-indigo-200 shadow-xl shadow-indigo-500/10 -translate-y-1' : 'border-gray-200 shadow-sm'}
        `}
      >
        
        {/* Top Section: Icon & Menu */}
        <div className="p-4 md:p-5 flex items-start justify-between relative z-10">
          <div className="flex items-start gap-3 md:gap-4 overflow-hidden flex-1">
            {/* File Icon Container */}
            <div className={`
              flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300
              ${isHovered ? 'bg-gray-50 ring-1 ring-gray-200' : 'bg-gray-50/50'}
            `}>
              {getFileIcon(doc.mimeType)}
            </div>
            
            {/* Title & Meta */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate pr-2 leading-tight" title={doc.originalName}>
                {doc.originalName}
              </h3>
              <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md font-medium text-gray-600">
                  {fileExtension}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* Context Menu Trigger - Only Delete */}
          <div className="relative" ref={menuRef}>
            <button
              ref={actionsButtonRef}
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className={`
                p-1.5 md:p-2 rounded-lg transition-all duration-200 outline-none
                ${showActions ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu - Only Delete Option */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1.5">
                    {/* Only Delete Option */}
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle Section: Info Grid */}
        <div className="px-4 md:px-5 pb-3 md:pb-4 flex-1">
          {/* Category Pill */}
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-4
            ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}
          `}>
            {categoryStyle.icon}
            <span className="capitalize">{doc.category || "Uncategorized"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
             {/* Upload Date */}
             <div className="bg-gray-50 rounded-lg p-2 md:p-2.5 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Calendar size={12} />
                  <span>Date</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {formatDate(doc.uploadDate)}
                </div>
             </div>

             {/* Size */}
             <div className="bg-gray-50 rounded-lg p-2 md:p-2.5 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <HardDrive size={12} />
                  <span>Size</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {formatFileSize(doc.fileSize).split(' ')[0]} 
                  <span className="text-xs text-gray-500 ml-0.5">{formatFileSize(doc.fileSize).split(' ')[1]}</span>
                </div>
             </div>
          </div>
        </div>

        {/* User Info (Conditional) */}
        {showUser && doc.uploadedBy && (
          <div className="px-4 md:px-5 pb-3 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3 p-2 rounded-lg bg-gray-50/80 border border-gray-100">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                 {doc.uploadedBy.fullName?.charAt(0) || <User size={12} />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Uploaded by</span>
                <span className="text-sm font-medium text-gray-700 leading-none truncate max-w-[120px] md:max-w-none">
                  {doc.uploadedBy.fullName}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: Primary Actions */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 mt-auto">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* View Button with Glass Shine Effect */}
            <button
              onClick={handleView}
              className="group relative overflow-hidden flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20"
            >
              {/* Shine Element */}
              <div 
                className="
                  absolute top-0 -left-full 
                  w-24 h-full 
                  bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  -skew-x-12 
                  transition-all duration-700 ease-in-out 
                  group-hover:left-[120%]
                " 
              />
              
              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Eye size={16} />
                View
              </div>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for closing menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={(e) => {
            e.stopPropagation()
            setShowActions(false)
          }}
        />
      )}
    </motion.div>
  )
}

export default DocumentCard