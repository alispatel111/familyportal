"use client"

import "../styles/cards.css"
import "../styles/buttons.css"

const DocumentCard = ({ document, onDelete, showUser = false }) => {
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return "fas fa-file-pdf"
    if (mimeType?.includes("image")) return "fas fa-file-image"
    if (mimeType?.includes("document")) return "fas fa-file-word"
    return "fas fa-file"
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleView = () => {
    console.log("=== VIEW BUTTON CLICKED ===")
    console.log("Document ID:", document._id)
    console.log("File URL:", document.fileUrl)

    if (!document.fileUrl) {
      console.error("❌ ERROR: document.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot view file.")
      }
      return
    }

    console.log("✅ Opening view URL:", document.fileUrl)
    window.open(document.fileUrl, "_blank")
  }

  const handleDownload = () => {
    console.log("=== DOWNLOAD BUTTON CLICKED ===")
    console.log("Document ID:", document._id)
    console.log("Original filename:", document.originalName)
    console.log("File URL:", document.fileUrl)

    if (!document.fileUrl) {
      console.error("❌ ERROR: document.fileUrl is missing!")
      if (window.showToast) {
        window.showToast("error", "Error", "Document URL is missing. Cannot download file.")
      }
      return
    }

    if (typeof window === "undefined") {
      console.error("❌ Not in browser environment")
      return
    }

    const downloadUrl = `${document.fileUrl}?download=true`
    console.log("🚀 Download URL:", downloadUrl)

    try {
      if (typeof window.document !== "undefined" && window.document.body) {
        console.log("📎 Using window.document.body method")
        const link = window.document.createElement("a")
        link.href = downloadUrl
        link.download = document.originalName
        link.target = "_blank"
        link.style.display = "none"

        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)

        console.log("✅ Download initiated successfully")

        if (window.showToast) {
          window.showToast("success", "Download Started", `Downloading ${document.originalName}`)
        }
        return
      } else {
        throw new Error("window.document.body not available")
      }
    } catch (error) {
      console.error("❌ Download failed:", error)
      if (window.showToast) {
        window.showToast("error", "Download Failed", "Unable to download file. Please try again.")
      }
    }
  }

  const handleDelete = () => {
    console.log("=== DELETE BUTTON CLICKED ===")
    console.log("Document ID:", document._id)

    if (window.confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      console.log("🗑️ User confirmed deletion")
      onDelete(document._id)
    } else {
      console.log("❌ User cancelled deletion")
    }
  }

  return (
    <div className="document-card">
      <div className="document-icon">
        <i className={getFileIcon(document.mimeType)}></i>
      </div>

      <div className="document-info">
        <h3>{document.originalName}</h3>
        <div className="document-category">
          <i className="fas fa-tag"></i>
          {document.category}
        </div>

        <div className="document-meta">
          {showUser && (
            <div className="document-meta-item">
              <i className="fas fa-user"></i>
              {document.uploadedBy.fullName}
            </div>
          )}
          <div className="document-meta-item">
            <i className="fas fa-calendar"></i>
            {formatDate(document.uploadDate)}
          </div>
          <div className="document-meta-item">
            <i className="fas fa-weight-hanging"></i>
            {formatFileSize(document.fileSize)}
          </div>
        </div>
      </div>

      <div className="document-actions">
        <button onClick={handleView} className="btn btn-sm btn-primary">
          <i className="fas fa-eye"></i>
          View
        </button>
        <button onClick={handleDownload} className="btn btn-sm btn-secondary">
          <i className="fas fa-download"></i>
          Download
        </button>
        <button onClick={handleDelete} className="btn btn-sm btn-danger">
          <i className="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
  )
}

export default DocumentCard
