"use client"

import { useState, useEffect } from "react"

const FolderModal = ({ isOpen, onClose, onSave, folder = null }) => {
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

  if (!isOpen && !isAnimating) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl transition-all duration-500 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* 装饰性顶部条 */}
        <div 
          className="h-2 transition-all duration-700"
          style={{ background: `linear-gradient(to right, ${formData.color}60, ${formData.color})` }}
        />

        <div className="p-6 sm:p-8">
          {/* 头部 */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {folder ? "Edit Folder" : "Create New Folder"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {folder ? "Update your folder details" : "Organize your documents in a new folder"}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 active:scale-95"
            >
              <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 文件夹名称 */}
            <div className="group">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-400"
                  placeholder="Enter folder name"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="group">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-400"
                  placeholder="Describe what this folder contains..."
                />
                <div className="pointer-events-none absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.description.length}/200
                </div>
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="group">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Folder Color
              </label>
              <div className="grid grid-cols-5 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                    className={`group/color relative h-14 rounded-xl border-2 transition-all duration-300 ${
                      formData.color === color.value
                        ? 'scale-105 border-gray-900 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {/* 选中指示器 */}
                    {formData.color === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
                        <svg className="h-6 w-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    {/* 悬停效果 */}
                    <div className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity group-hover/color:opacity-20" />
                  </button>
                ))}
              </div>
            </div>

            {/* 预览 */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ backgroundColor: formData.color }}
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formData.name || "Folder Preview"}
                  </div>
                  {formData.description && (
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {formData.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {folder ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        )}
                      </svg>
                      {folder ? "Update Folder" : "Create Folder"}
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