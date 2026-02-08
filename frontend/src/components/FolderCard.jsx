"use client"

import { useState } from "react"

const FolderCard = ({ folder, onEdit, onDelete, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

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
      className={`relative group overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 p-5 cursor-pointer transition-all duration-500 ${
        isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      } ${isPressed ? "scale-[0.98] shadow-lg" : "shadow-md hover:shadow-2xl"} ${
        isHovered ? "-translate-y-2" : ""
      } border border-gray-200/80 hover:border-gray-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseOut={() => setIsPressed(false)}
      onClick={handleOpen}
    >
      {/* 浮动粒子动画 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              backgroundColor: folder.color,
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* 渐变背景效果 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${folder.color}15, transparent 50%)`,
        }}
      />

      {/* 文件夹图标容器 */}
      <div className="relative mb-4">
        <div className="relative inline-block">
          {/* 图标阴影效果 */}
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500"
            style={{ backgroundColor: folder.color }}
          />
          
          {/* 主图标 */}
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-white transition-all duration-500 ${
              isHovered ? "scale-110 rotate-3" : ""
            }`}
            style={{
              backgroundColor: folder.color,
              boxShadow: `0 8px 32px -8px ${folder.color}60, 0 4px 16px -4px ${folder.color}40, inset 0 1px 1px ${folder.color}30`,
            }}
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
        </div>
        
        {/* 文档计数徽章 */}
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-60"></div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-xs font-bold text-white shadow-lg">
              {folder.documentCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 文件夹信息 */}
      <div className="relative">
        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 leading-tight transition-all duration-300 group-hover:text-gray-800">
          {folder.name}
        </h3>

        {folder.description && (
          <p className="mb-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {folder.description}
          </p>
        )}

        {/* 元数据 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span>{folder.documentCount || 0} docs</span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatDate(folder.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="relative flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="text-xs text-gray-500">
          Created {formatDate(folder.createdAt)}
        </div>

        <div className="flex items-center gap-2">
          {/* 编辑按钮 */}
          <button
            onClick={handleEdit}
            className="group/btn relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            title="Edit folder"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 transition-all duration-300 group-hover/btn:opacity-100"></div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 opacity-100 group-hover/btn:opacity-0"></div>
            <svg className="relative h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* 删除按钮 */}
          <button
            onClick={handleDelete}
            className="group/btn relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            title="Delete folder"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 opacity-0 transition-all duration-300 group-hover/btn:opacity-100"></div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 opacity-100 group-hover/btn:opacity-0"></div>
            <svg className="relative h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 悬停边框效果 */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-700 opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 2px ${folder.color}30`,
        }}
      />
    </div>
  )
}

export default FolderCard