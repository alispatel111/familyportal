"use client"

import { useState, useEffect } from "react"
import { 
  X, 
  Folder, 
  FolderPlus, 
  FolderPen, 
  Palette, 
  FileText, 
  Check, 
  Loader2, 
  Save 
} from "lucide-react"

const FolderModal = ({ isOpen, onClose, onSave, folder = null }) => {
  // --- STATE & LOGIC (UNCHANGED) ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const colors = [
    { value: "#6366f1", name: "Indigo" },
    { value: "#8b5cf6", name: "Purple" },
    { value: "#06b6d4", name: "Cyan" },
    { value: "#10b981", name: "Emerald" },
    { value: "#f59e0b", name: "Amber" },
    { value: "#ef4444", name: "Red" },
    { value: "#ec4899", name: "Pink" },
    { value: "#84cc16", name: "Lime" },
    { value: "#f97316", name: "Orange" },
    { value: "#6b7280", name: "Gray" },
  ]

  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name || "",
        description: folder.description || "",
        color: folder.color || "#6366f1",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#6366f1",
      })
    }
  }, [folder, isOpen])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      if (window.showToast) {
        window.showToast("error", "Error", "Folder name is required")
      }
      return
    }

    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Error saving folder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // --- RENDER ---

  if (!isOpen && !isAnimating) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur Effect */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5 transition-all duration-500 ease-out transform ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-8'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Top Accent Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
          style={{ backgroundColor: formData.color }}
        />

        <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
            <div className="flex gap-4">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition-colors duration-300"
                style={{ backgroundColor: `${formData.color}15`, color: formData.color }}
              >
                {folder ? <FolderPen size={24} /> : <FolderPlus size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {folder ? "Edit Folder" : "New Folder"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {folder ? "Update your folder details below." : "Create a space to organize your files."}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Folder Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Folder Name <span className="text-red-500 text-xs">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Folder size={18} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none hover:border-gray-300"
                  placeholder="e.g. Marketing Assets"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                   Description
                </label>
                <span className={`text-xs transition-colors ${formData.description.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {formData.description.length}/200
                </span>
              </div>
              <div className="relative group">
                <div className="absolute top-3.5 left-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <FileText size={18} />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={200}
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none resize-none hover:border-gray-300"
                  placeholder="What's inside this folder?"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Palette size={16} /> Color Tag
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                    className="group relative flex items-center justify-center h-9 w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    <span className={`absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-20`} />
                    
                    {formData.color === color.value && (
                      <span className="animate-in zoom-in duration-200 text-white drop-shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="mt-4 pt-6 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Preview</div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-inner transition-colors duration-500"
                  style={{ backgroundColor: formData.color }}
                >
                  <Folder size={28} fill="currentColor" fillOpacity={0.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-base">
                    {formData.name || <span className="text-gray-400 italic">Untitled Folder</span>}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {formData.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 group relative overflow-hidden rounded-xl px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.color}, ${formData.color}dd)` 
                }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{folder ? "Save Changes" : "Create Folder"}</span>
                    </>
                  )}
                </div>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default FolderModal