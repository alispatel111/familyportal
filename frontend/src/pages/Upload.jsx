"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/upload.css"
import "../styles/buttons.css"
import "../styles/forms.css"

const Upload = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    category: "",
    file: null,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

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

  const handleChange = (e) => {
    if (e.target.name === "file") {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        file: file,
      })

      // Clear any previous errors
      if (error) setError("")
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    console.log("=== UPLOAD FORM SUBMITTED ===")
    console.log("📁 Selected file:", formData.file)
    console.log("📂 Selected category:", formData.category)

    if (!formData.file || !formData.category) {
      console.error("❌ Validation failed: Missing file or category")
      setError("Please select a file and category")
      setUploading(false)
      return
    }

    // Validate file size (10MB)
    if (formData.file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      setUploading(false)
      return
    }

    // Validate file type
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

    console.log("📤 Sending upload request...")

    try {
      // Simulate progress for better UX
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("✅ Upload successful!")
      console.log("📊 Server response:", response.data)

      setSuccess("Document uploaded successfully!")

      // Show success toast
      if (window.showToast) {
        window.showToast("success", "Upload Successful!", `${formData.file.name} has been uploaded successfully`)
      }

      // Reset form
      setFormData({ category: "", file: null })

      // Reset file input
      const fileInput = document.getElementById("file")
      if (fileInput) fileInput.value = ""

      setTimeout(() => {
        navigate("/my-documents")
      }, 2000)
    } catch (error) {
      console.error("❌ Upload failed!")
      console.error("Error details:", error)

      const errorMessage = error.response?.data?.message || "Upload failed"
      setError(errorMessage)

      // Show error toast
      if (window.showToast) {
        window.showToast("error", "Upload Failed", errorMessage)
      }

      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (!file) return "fas fa-file"

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
    <div className="upload-container">
      <div className="upload-card">
        <h1>
          <i className="fas fa-cloud-upload-alt"></i>
          Upload Document
        </h1>
        <p>Upload your important documents securely to the family portal</p>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="upload-success">
              <i className="fas fa-check-circle"></i>
              <h3>Upload Successful!</h3>
              <p>{success}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="category">
              <i className="fas fa-tags"></i>
              Document Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="file-upload-area">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                required
                className="file-input"
              />
              <label htmlFor="file" className={`file-input-label ${formData.file ? "file-selected" : ""}`}>
                <div className="upload-icon">
                  <i className={formData.file ? getFileIcon(formData.file) : "fas fa-cloud-upload-alt"}></i>
                </div>
                <div className="upload-text">{formData.file ? "File Selected" : "Choose File or Drag & Drop"}</div>
                <div className="upload-subtext">
                  {formData.file ? formData.file.name : "PDF, JPG, PNG, DOCX files up to 10MB"}
                </div>
              </label>
            </div>

            <div className="file-info">
              <i className="fas fa-info-circle"></i>
              Supported formats: PDF, JPG, PNG, DOCX • Maximum size: 10MB
            </div>
          </div>

          {formData.file && (
            <div className="file-preview">
              <h3>
                <i className={getFileIcon(formData.file)}></i>
                File Preview
              </h3>
              <div className="file-preview-item">
                <div className="file-preview-label">
                  <i className="fas fa-file"></i>
                  Name:
                </div>
                <div className="file-preview-value">{formData.file.name}</div>
              </div>
              <div className="file-preview-item">
                <div className="file-preview-label">
                  <i className="fas fa-weight-hanging"></i>
                  Size:
                </div>
                <div className="file-preview-value">{formatFileSize(formData.file.size)}</div>
              </div>
              <div className="file-preview-item">
                <div className="file-preview-label">
                  <i className="fas fa-file-code"></i>
                  Type:
                </div>
                <div className="file-preview-value">{formData.file.type}</div>
              </div>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="progress-text">
                <i className="fas fa-spinner fa-spin"></i>
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${uploading ? "btn-loading" : ""}`}
            disabled={uploading}
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
  )
}

export default Upload
