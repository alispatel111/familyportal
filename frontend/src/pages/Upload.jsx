"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  FolderOpen, 
  ArrowLeft, 
  File, 
  FileImage, 
  X, 
  Loader2, 
  ChevronDown,
  ShieldCheck,
  Check
} from "lucide-react"

// --- Sub-Component: Modern Custom Dropdown ---
const CustomSelect = ({ label, options, value, onChange, placeholder, icon: Icon, required }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  // Find display label for folders (objects) or categories (strings)
  const getDisplayValue = () => {
    if (!value) return placeholder
    // Check if options are objects (folders) or strings (categories)
    const selectedOption = options.find(opt => (opt._id || opt) === value)
    return selectedOption?.name || selectedOption || value
  }

  return (
    <div className="space-y-2 group relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 ml-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full pl-12 pr-10 py-4 bg-slate-50 border rounded-xl text-left font-medium
            transition-all duration-300 outline-none flex items-center justify-between
            ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500 bg-white' : 'border-slate-200 hover:bg-slate-100'}
            ${!value ? 'text-slate-400' : 'text-slate-700'}
          `}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <span className="truncate">{getDisplayValue()}</span>
          <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </button>

        {/* Animated Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slide-down scrollbar-thin">
            <div className="p-1">
              {options.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">No options available</div>
              ) : (
                options.map((option) => {
                  const optValue = option._id || option
                  const optLabel = option.name || option
                  const isSelected = value === optValue

                  return (
                    <div
                      key={optValue}
                      onClick={() => handleSelect(optValue)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-200
                        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <span className="truncate">{optLabel}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Main Component ---
const Upload = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ category: "", file: null, folderId: "" })
  const [folders, setFolders] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const categories = [
    "Aadhaar Card",
    "PAN Card",
    "Passport",
    "Driving License",
    "Medical Records",
    "Insurance",
    "Bank Statements",
    "Property Documents",
    "Educational Certificates",
    "Other",
  ]

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const response = await axios.get("/api/folders")
      setFolders(response.data.folders)
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, PNG, and DOCX files are allowed")
      return
    }

    setFormData({ ...formData, file })
    setUploadedFile(file)
    setError("")
  }

  // Simplified handler for custom dropdowns
  const handleDropdownChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleChange = (e) => {
    if (e.target.name === "file") {
      const file = e.target.files[0]
      handleFileSelect(file)
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    if (!formData.file || !formData.category) {
      setError("Please select a file and category")
      setUploading(false)
      return
    }

    const uploadData = new FormData()
    uploadData.append("document", formData.file)
    uploadData.append("category", formData.category)
    if (formData.folderId) {
      uploadData.append("folderId", formData.folderId)
    }

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await axios.post("/api/documents", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setSuccess("Document uploaded successfully!")
      if (window.showToast) {
        window.showToast("success", "Upload Successful!", `${formData.file.name} has been uploaded successfully`)
      }

      setFormData({ category: "", file: null, folderId: "" })
      setUploadedFile(null)
      const fileInput = document.getElementById("file")
      if (fileInput) fileInput.value = ""

      setTimeout(() => {
        navigate("/my-documents")
      }, 2000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Upload failed"
      setError(errorMessage)
      if (window.showToast) {
        window.showToast("error", "Upload Failed", errorMessage)
      }
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (!file) return <UploadCloud className="w-10 h-10 text-indigo-500" />
    if (file.type.includes("pdf")) return <FileText className="w-10 h-10 text-red-500" />
    if (file.type.includes("image")) return <FileImage className="w-10 h-10 text-blue-500" />
    return <File className="w-10 h-10 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto animate-slide-up">
        
        {/* Modern Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-slate-100 relative group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:opacity-80 transition-opacity duration-500"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:opacity-80 transition-opacity duration-500"></div>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner text-indigo-600">
               <UploadCloud size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Documents</h1>
              <p className="mt-2 text-slate-500 text-lg">
                Securely upload and organize your important files to the family portal.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-shake">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Upload Failed</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-800">Success</h3>
                  <p className="text-sm text-emerald-600">{success}</p>
                </div>
              </div>
            )}

            {/* Inputs Grid with Custom Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <CustomSelect
                label="Document Category"
                placeholder="Select Category"
                options={categories}
                value={formData.category}
                onChange={(val) => handleDropdownChange('category', val)}
                icon={ShieldCheck}
                required
              />

              <CustomSelect
                label="Target Folder"
                placeholder="Root Directory"
                options={folders}
                value={formData.folderId}
                onChange={(val) => handleDropdownChange('folderId', val)}
                icon={FolderOpen}
              />

            </div>

            {/* Drag & Drop Zone */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Upload File</label>
              
              <div
                className={`
                  relative group cursor-pointer transition-all duration-300 ease-out
                  rounded-2xl border-2 border-dashed p-10 text-center overflow-hidden
                  ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-lg' 
                    : uploadedFile 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }
                `}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file').click()}
              >
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  required
                  className="hidden"
                />

                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                    ${uploadedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-200'}
                  `}>
                    {getFileIcon(uploadedFile)}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-700">
                      {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {uploadedFile ? formatFileSize(uploadedFile.size) : "PDF, JPG, PNG, DOCX (Max 10MB)"}
                    </p>
                  </div>

                  {!uploadedFile && (
                    <button type="button" className="mt-2 px-6 py-2 bg-white text-slate-700 text-sm font-semibold rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors pointer-events-none">
                      Browse Files
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* File Details */}
            {uploadedFile && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    {uploadedFile.type.includes('image') ? <FileImage className="text-blue-500" /> : <FileText className="text-red-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm line-clamp-1 break-all">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 font-medium bg-slate-200 inline-block px-2 py-0.5 rounded-full mt-1">
                      {uploadedFile.type.split('/')[1].toUpperCase()} • {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setFormData({...formData, file: null});
                    const fileInput = document.getElementById("file");
                    if (fileInput) fileInput.value = "";
                  }}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg transition-all duration-300 ease-out relative"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-full animate-shimmer"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-4">
               <button
                type="button"
                onClick={() => navigate("/my-documents")}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              >
                <ArrowLeft size={20} />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                disabled={uploading || !formData.file || !formData.category}
                className={`
                  flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform
                  ${uploading || !formData.file || !formData.category
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-indigo-500/30 ring-offset-2 focus:ring-2 focus:ring-indigo-500"
                  }
                `}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 85% { transform: translateX(-4px); }
          45%, 65% { transform: translateX(4px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-down { animation: slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        
        /* Custom Scrollbar for Dropdown */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default Upload