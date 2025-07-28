"use client"

const DocumentCard = ({ document, onDelete, showUser = false }) => {
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return "📄"
    if (mimeType?.includes("image")) return "🖼️"
    if (mimeType?.includes("document")) return "📝" // For DOCX
    return "📎" // Default icon
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  // Function to handle viewing the document (opens in new tab)
  const handleView = () => {
    console.log("=== VIEW BUTTON CLICKED ===")
    console.log("Document ID:", document._id)
    console.log("File URL:", document.fileUrl)

    if (!document.fileUrl) {
      console.error("❌ ERROR: document.fileUrl is missing!")
      alert("Document URL is missing. Cannot view file.")
      return
    }

    // For local storage, just open the URL directly
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
      alert("Document URL is missing. Cannot download file.")
      return
    }

    // Check if we're in browser environment
    if (typeof window === "undefined") {
      console.error("❌ Not in browser environment")
      return
    }

    // Create download URL
    const downloadUrl = `${document.fileUrl}?download=true`
    console.log("🚀 Download URL:", downloadUrl)

    try {
      // Method 1: Try creating a download link using window.document
      if (typeof window.document !== "undefined" && window.document.body) {
        console.log("📎 Using window.document.body method")
        const link = window.document.createElement("a")
        link.href = downloadUrl
        link.download = document.originalName
        link.target = "_blank"
        link.style.display = "none"

        // Add to DOM, click, and remove
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)

        console.log("✅ Download initiated successfully")
        return
      } else {
        throw new Error("window.document.body not available")
      }
    } catch (error) {
      console.error("❌ Method 1 failed:", error)

      try {
        // Method 2: Direct window.open with download URL
        console.log("🔄 Using window.open method")
        const newWindow = window.open(downloadUrl, "_blank")

        if (newWindow) {
          console.log("✅ Download window opened")
          return
        } else {
          throw new Error("Popup blocked or failed")
        }
      } catch (error2) {
        console.error("❌ Method 2 failed:", error2)

        try {
          // Method 3: Create invisible iframe for download
          console.log("🔄 Using iframe method")
          const iframe = window.document.createElement("iframe")
          iframe.style.display = "none"
          iframe.src = downloadUrl
          window.document.body.appendChild(iframe)

          // Remove iframe after 5 seconds
          setTimeout(() => {
            if (window.document.body.contains(iframe)) {
              window.document.body.removeChild(iframe)
            }
          }, 5000)

          console.log("✅ Download initiated via iframe")
          return
        } catch (error3) {
          console.error("❌ Method 3 failed:", error3)

          try {
            // Method 4: Location assignment as final fallback
            console.log("🔄 Using location assignment method")
            window.location.href = downloadUrl
            console.log("✅ Download initiated via location")
          } catch (error4) {
            console.error("❌ All download methods failed:", error4)
            alert("Download failed. Please try again or contact support.")
          }
        }
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
      <div className="document-icon">{getFileIcon(document.mimeType)}</div>

      <div className="document-info">
        <h3 className="document-name">{document.originalName}</h3>
        <p className="document-category">{document.category}</p>
        {showUser && <p className="document-user">Uploaded by: {document.uploadedBy.fullName}</p>}
        <p className="document-date">{new Date(document.uploadDate).toLocaleDateString()}</p>
        <p className="document-size">{formatFileSize(document.fileSize)}</p>

        {/* Debug info - remove in production */}
        <div style={{ fontSize: "10px", color: "#666", marginTop: "5px" }}>
          <p>🔒 Secure Local Storage</p>
          <p>URL: {document.fileUrl ? "✅ Present" : "❌ Missing"}</p>
        </div>
      </div>

      <div className="document-actions">
        <button onClick={handleView} className="btn btn-sm btn-primary">
          👁️ View
        </button>
        <button onClick={handleDownload} className="btn btn-sm btn-outline">
          ⬇️ Download
        </button>
        <button onClick={handleDelete} className="btn btn-sm btn-danger">
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

export default DocumentCard
