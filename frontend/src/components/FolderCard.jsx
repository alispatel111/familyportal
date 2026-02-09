"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Folder, 
  Pencil, 
  Trash2, 
  Calendar, 
  FileText, 
  MoreVertical,
  ArrowUpRight,
  Layers
} from "lucide-react"

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
      }, 500)
    }
  }

  const handleOpen = () => {
    onOpen(folder)
  }

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleOpen}
          className="relative group w-full max-w-sm sm:max-w-md mx-auto"
        >
          {/* Outer Glow Effect based on folder color */}
          <div 
            className="absolute -inset-1 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none"
            style={{ backgroundColor: folder.color }}
          />

          {/* Main Card Container */}
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500">
            
            {/* Background Decorative Element */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700"
              style={{ backgroundColor: folder.color }}
            />

            <div className="p-5 sm:p-7">
              {/* Top Row: Icon & Action Menu */}
              <div className="flex items-start justify-between">
                <div className="relative">
                  {/* Dynamic Icon Box */}
                  <motion.div
                    animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                    className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-lg transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${folder.color} 0%, ${folder.color}cc 100%)`,
                      boxShadow: `0 10px 20px -5px ${folder.color}66`
                    }}
                  >
                    <Folder className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2} />
                    
                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
                  </motion.div>

                  {/* Document Badge */}
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-4 ring-white shadow-xl">
                    {folder.documentCount || 0}
                  </div>
                </div>

                <div className="flex gap-1">
                   <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <MoreVertical className="h-5 w-5 text-slate-400" />
                   </button>
                </div>
              </div>

              {/* Text Information */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight line-clamp-1">
                    {folder.name}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                
                <p className="text-sm sm:text-base text-slate-500 line-clamp-2 leading-relaxed font-medium">
                  {folder.description || "Organize your creative assets and documents seamlessly."}
                </p>
              </div>

              {/* Stats & Metadata - Responsive Grid */}
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100/50 border border-slate-200/50 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{folder.documentCount || 0} ITEMS</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100/50 border border-slate-200/50 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(folder.createdAt)}</span>
                </div>
              </div>

              {/* Bottom Actions Area */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Updated {formatDate(folder.createdAt)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Pencil className="h-4.5 w-4.5" />
                  </motion.button>

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "#ef4444", color: "#ffffff" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all duration-300 shadow-sm"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Subtle Animated Bottom Bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1.5 w-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              style={{ backgroundColor: folder.color }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FolderCard