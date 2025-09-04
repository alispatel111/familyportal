"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Upload = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ category: "", file: null, folderId: "" }) // Added folderId to form data
  const [folders, setFolders] = useState([]) // Added folders state
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

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
      setFormData({ ...formData, file: files[0] })
      if (error) setError("")
    }
  }

  const handleChange = (e) => {
    if (e.target.name === "file") {
      const file = e.target.files[0]
      setFormData({ ...formData, file })
      if (error) setError("")
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

    if (formData.file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      setUploading(false)
      return
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(formData.file.type)) {
      setError("Only PDF, JPG, PNG, and DOCX files are allowed")
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

      setFormData({ category: "", file: null, folderId: "" }) // Reset folderId in form data
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Upload Document
            </span>
          </h1>
          <p className="text-gray-600">Securely upload your important documents to the family portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-shake">
                  <i className="fas fa-exclamation-circle mt-0.5 text-red-500"></i>
                  <div>
                    <p className="font-medium">Upload Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <div>
                      <p className="font-medium">Upload Successful!</p>
                      <p className="text-sm mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder (Optional)
                </label>
                <div className="relative">
                  <select
                    id="folderId"
                    name="folderId"
                    value={formData.folderId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        📁 {folder.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a folder to organize your document, or leave empty to upload to root
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>

                <div
                  className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${isDragging ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 bg-gray-50"} ${formData.file ? "border-green-500 bg-green-50" : ""} hover:border-blue-400 hover:bg-blue-50`}
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <i
                      className={`text-2xl ${formData.file ? getFileIcon(formData.file) : "fas fa-cloud-upload-alt"}`}
                    ></i>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-medium text-gray-900 mb-1">
                      {formData.file ? formData.file.name : "Click to browse or drag & drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formData.file ? formatFileSize(formData.file.size) : "PDF, JPG, PNG, DOCX (Max 10MB)"}
                    </p>
                  </div>
                </div>
              </div>

              {formData.file && (
                <div className="rounded-2xl bg-blue-50 p-5 animate-fade-in">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-file mr-2 text-blue-600"></i>
                    File Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <i className="fas fa-file"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs text-gray-500">Name</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{formData.file.name}</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <i className="fas fa-weight-hanging"></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Size</div>
                        <div className="text-sm font-medium text-gray-900">{formatFileSize(formData.file.size)}</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center md:col-span-2">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <i className="fas fa-file-code"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs text-gray-500">Type</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{formData.file.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-spinner fa-spin mr-2 text-blue-600"></i>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"}`}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i>
                    Upload Document
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/my-documents")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to My Documents
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Upload
