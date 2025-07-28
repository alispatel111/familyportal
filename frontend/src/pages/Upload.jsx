"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Upload = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    category: "",
    file: null,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
      setFormData({
        ...formData,
        file: e.target.files[0],
      })
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

    console.log("=== UPLOAD FORM SUBMITTED ===")
    console.log("📁 Selected file:", formData.file)
    console.log("📂 Selected category:", formData.category)

    if (!formData.file || !formData.category) {
      console.error("❌ Validation failed: Missing file or category")
      setError("Please select a file and category")
      setUploading(false)
      return
    }

    // Log file details
    console.log("📄 File details:")
    console.log("  - Name:", formData.file.name)
    console.log("  - Size:", formData.file.size, "bytes")
    console.log("  - Type:", formData.file.type)
    console.log("  - Last modified:", new Date(formData.file.lastModified))

    const uploadData = new FormData()
    uploadData.append("document", formData.file)
    uploadData.append("category", formData.category)

    console.log("📤 Sending upload request...")

    try {
      const response = await axios.post("/api/documents", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("✅ Upload successful!")
      console.log("📊 Server response:", response.data)
      console.log("🔗 Document URL:", response.data.document?.fileUrl)

      setSuccess("Document uploaded successfully!")
      setFormData({ category: "", file: null })

      setTimeout(() => {
        navigate("/my-documents")
      }, 2000)
    } catch (error) {
      console.error("❌ Upload failed!")
      console.error("Error details:", error)
      console.error("Error response:", error.response?.data)
      setError(error.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>📤 Upload Document</h1>
        <p>Upload your important documents securely</p>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="category">Document Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file">Select File</label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              required
            />
            <small className="file-info">Supported formats: PDF, JPG, PNG, DOCX (Max size: 10MB)</small>
          </div>

          {formData.file && (
            <div className="file-preview">
              <h3>File Preview:</h3>
              <p>
                <strong>Name:</strong> {formData.file.name}
              </p>
              <p>
                <strong>Size:</strong> {(formData.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <strong>Type:</strong> {formData.file.type}
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Upload
