"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

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
    if (!file) return "fas fa-cloud-upload-alt"
    if (file.type.includes("pdf")) return "fas fa-file-pdf"
    if (file.type.includes("image")) return "fas fa-file-image"
    if (file.type.includes("document")) return "fas fa-file-word"
    return "fas fa-file"
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3">Upload Document</h1>
            <p className="text-blue-100">Securely upload your important documents to the family portal</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 animate-shake">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-800">Upload Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">Upload Successful!</p>
                    <p className="text-sm text-green-600 mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                Document Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Folder Selection */}
            <div>
              <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-3">
                Folder (Optional)
              </label>
              <div className="relative">
                <select
                  id="folderId"
                  name="folderId"
                  value={formData.folderId}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm"
                >
                  <option value="">No Folder (Root)</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Choose a folder to organize your document, or leave empty to upload to root
              </p>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">File Upload</label>
              
              <div
                className={`relative rounded-2xl border-2 ${isDragging ? 'border-blue-500' : 'border-dashed border-gray-300'} ${uploadedFile ? 'border-green-500' : ''} p-8 text-center transition-all duration-300 ${isDragging ? 'bg-blue-50 scale-[1.02]' : 'bg-gray-50'} hover:bg-blue-50`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  required
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                
                <div className="mb-6">
                  <div className={`w-20 h-20 rounded-full ${uploadedFile ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center mx-auto mb-4`}>
                    <svg className={`w-10 h-10 ${uploadedFile ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {uploadedFile ? uploadedFile.name : "Drag & drop or click to browse"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {uploadedFile ? formatFileSize(uploadedFile.size) : "PDF, JPG, PNG, DOCX (Max 10MB)"}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => document.getElementById('file').click()}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Browse Files
                </button>
              </div>
            </div>

            {/* File Preview */}
            {uploadedFile && (
              <div className="bg-blue-50 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  File Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">File Name</div>
                    <div className="font-medium text-gray-900 truncate">{uploadedFile.name}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">File Size</div>
                    <div className="font-medium text-gray-900">{formatFileSize(uploadedFile.size)}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">File Type</div>
                    <div className="font-medium text-gray-900">{uploadedFile.type}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Uploading your document...</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !formData.file || !formData.category}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                uploading || !formData.file || !formData.category
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/my-documents")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 group"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to My Documents</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Upload