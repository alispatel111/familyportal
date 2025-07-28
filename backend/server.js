const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
require("dotenv").config()

const app = express()

// Trust proxy for Vercel
app.set("trust proxy", 1)

// Create uploads directory if it doesn't exist (for local development only)
const uploadsDir = path.join(__dirname, "uploads")
if (process.env.NODE_ENV !== "production" && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("✅ Created uploads directory")
}

// Multer storage configuration - Use memory storage for Vercel
const storage =
  process.env.NODE_ENV === "production"
    ? multer.memoryStorage() // Memory storage for Vercel
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads/")
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const fileExtension = path.extname(file.originalname)
          const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension
          console.log(`📁 Generated filename: ${fileName}`)
          cb(null, fileName)
        },
      })

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  if (allowedTypes.includes(file.mimetype)) {
    console.log(`✅ File type allowed: ${file.mimetype}`)
    cb(null, true)
  } else {
    console.log(`❌ File type not allowed: ${file.mimetype}`)
    cb(new Error("Only PDF, JPG, PNG, and DOCX files are allowed!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/family-portal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Check MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
})

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  fullName: { type: String, required: true },
  biometricEnabled: { type: Boolean, default: false },
  credentialId: { type: String, default: null },
  publicKey: { type: String, default: null }, // Store public key
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

// Document Schema - Modified for production
const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  filePath: { type: String }, // Optional for production
  fileData: { type: Buffer }, // Store file data in database for production
  category: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  fileSize: { type: Number },
  mimeType: { type: String },
})

const Document = mongoose.model("Document", documentSchema)

// CORS configuration - Updated for your actual frontend URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://familyportal.vercel.app", // Your exact frontend URL
  "https://familyportal2.vercel.app", // Alternative if needed
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🌐 CORS Request from origin:", origin)

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) {
        console.log("✅ CORS: Allowing request with no origin")
        return callback(null, true)
      }

      // Allow any vercel.app domain for development/staging
      if (origin && origin.includes(".vercel.app")) {
        console.log("✅ CORS: Allowing Vercel domain:", origin)
        return callback(null, true)
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log("✅ CORS: Allowing whitelisted origin:", origin)
        callback(null, true)
      } else {
        console.log("❌ CORS blocked origin:", origin)
        console.log("📋 Allowed origins:", allowedOrigins)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
)

// Handle preflight requests
app.options("*", cors())

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Session configuration - FIXED for production
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/family-portal",
      collectionName: "sessions",
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Important for cross-origin
    },
    name: "familyportal.sid", // Custom session name
  }),
)

// Enhanced Auth middleware with better logging
const requireAuth = (req, res, next) => {
  console.log("🔐 Auth Check:")
  console.log("  - Session ID:", req.sessionID)
  console.log("  - User ID in session:", req.session.userId)
  console.log("  - Session data:", req.session)

  if (!req.session.userId) {
    console.log("❌ Authentication failed: No user ID in session")
    return res.status(401).json({
      message: "Authentication required",
      sessionId: req.sessionID,
      hasSession: !!req.session,
      userId: req.session.userId,
    })
  }

  console.log("✅ Authentication successful for user:", req.session.userId)
  next()
}

const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const user = await User.findById(req.session.userId)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

// File serving middleware - Updated for production
app.use("/uploads", requireAuth, async (req, res, next) => {
  try {
    const filename = path.basename(req.path)
    console.log(`🔍 File access request: ${filename} by user: ${req.session.userId}`)

    // Find the document in database
    const document = await Document.findOne({ filename: filename })

    if (!document) {
      console.log(`❌ File not found in database: ${filename}`)
      return res.status(404).json({ message: "File not found" })
    }

    // Check if user has access to this file
    const user = await User.findById(req.session.userId)
    const canAccess =
      document.uploadedBy.toString() === req.session.userId || // Owner
      user.role === "admin" // Admin

    if (!canAccess) {
      console.log(`🚫 Access denied for file: ${filename} to user: ${req.session.userId}`)
      return res.status(403).json({ message: "Access denied to this file" })
    }

    console.log(`✅ File access granted: ${filename}`)

    // Set CORS headers
    res.header("Access-Control-Allow-Origin", req.headers.origin)
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Methods", "GET")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")

    // If download parameter is present, set download headers
    if (req.query.download === "true") {
      res.setHeader("Content-Disposition", `attachment; filename="${document.originalName}"`)
      console.log(`⬇️ Download headers set for: ${document.originalName}`)
    }

    // For production, serve from database
    if (process.env.NODE_ENV === "production" && document.fileData) {
      res.setHeader("Content-Type", document.mimeType)
      res.send(document.fileData)
    } else {
      // For development, serve from file system
      const filePath = path.join(__dirname, "uploads", filename)
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath)
      } else {
        res.status(404).json({ message: "Physical file not found" })
      }
    }
  } catch (error) {
    console.error("❌ Error in file access middleware:", error)
    res.status(500).json({ message: "Server error accessing file" })
  }
})

// Root route - Server status check
app.get("/", (req, res) => {
  res.json({
    message: "🏠 Family Document Portal Backend is running!",
    status: "✅ OK",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    storage: process.env.NODE_ENV === "production" ? "Database (MongoDB)" : "Local File System",
    security: {
      authentication: "Required for all file access",
      authorization: "Owner or Admin only",
      fileValidation: "Type and size limits enforced",
      sessionBased: "Secure session management",
    },
  })
})

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    storage: process.env.NODE_ENV === "production" ? "database" : "local-secure",
    timestamp: new Date().toISOString(),
  })
})

// Session debug route (remove in production)
app.get("/api/debug/session", (req, res) => {
  res.json({
    sessionId: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    userId: req.session.userId,
    userRole: req.session.userRole,
  })
})

// ==================== AUTH ROUTES ====================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: role || "member",
    })

    await user.save()

    req.session.userId = user._id
    req.session.userRole = user.role

    console.log(`✅ New user registered: ${user.username} (${user.role})`)
    console.log(`🔐 Session created: ${req.sessionID}`)

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        biometricEnabled: user.biometricEnabled,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Server error during signup" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    req.session.userId = user._id
    req.session.userRole = user.role

    console.log(`✅ User logged in: ${user.username}`)
    console.log(`🔐 Session created: ${req.sessionID}`)

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        biometricEnabled: user.biometricEnabled,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

app.post("/api/auth/logout", (req, res) => {
  const userId = req.session.userId
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("familyportal.sid")
    console.log(`✅ User logged out: ${userId}`)
    res.json({ message: "Logout successful" })
  })
})

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        biometricEnabled: user.biometricEnabled,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ==================== BIOMETRIC AUTHENTICATION ROUTES ====================

const generateChallenge = () => {
  return crypto.randomBytes(32)
}

// Check if any users have biometric enabled (for login page)
app.get("/api/auth/biometric/check-availability", async (req, res) => {
  try {
    const biometricUsers = await User.countDocuments({ biometricEnabled: true })
    res.json({
      available: biometricUsers > 0,
      count: biometricUsers,
    })
  } catch (error) {
    console.error("Biometric availability check error:", error)
    res.status(500).json({ message: "Server error checking biometric availability" })
  }
})

// IMMEDIATE BIOMETRIC LOGIN - No username required
app.post("/api/auth/biometric/login/immediate", async (req, res) => {
  try {
    console.log("🔐 Immediate biometric login request")

    // Get all users with biometric enabled
    const biometricUsers = await User.find({ biometricEnabled: true }).select("credentialId fullName username")

    if (biometricUsers.length === 0) {
      console.log("❌ No biometric users found")
      return res.status(400).json({ message: "No biometric authentication available" })
    }

    console.log(`✅ Found ${biometricUsers.length} biometric users`)

    const challenge = generateChallenge()
    req.session.challenge = challenge.toString("base64")

    // Create allowCredentials array with all registered biometric credentials
    const allowCredentials = biometricUsers.map((user) => ({
      id: user.credentialId, // Send as base64 string
      type: "public-key",
      transports: ["internal"],
    }))

    const publicKeyCredentialRequestOptions = {
      challenge: challenge.toString("base64"),
      allowCredentials: allowCredentials,
      userVerification: "required",
      timeout: 60000,
    }

    console.log(`✅ Immediate biometric options generated for ${biometricUsers.length} users`)
    console.log("📋 Options:", publicKeyCredentialRequestOptions)

    res.json({
      publicKeyCredentialRequestOptions,
      message: "Immediate biometric login options generated",
      userCount: biometricUsers.length,
    })
  } catch (error) {
    console.error("❌ Immediate biometric login error:", error)
    res.status(500).json({ message: "Server error during immediate biometric login" })
  }
})

app.post("/api/auth/biometric/register", requireAuth, async (req, res) => {
  try {
    console.log("🔐 Biometric registration request from user:", req.session.userId)

    const user = await User.findById(req.session.userId)
    if (!user) {
      console.log("❌ User not found for biometric registration")
      return res.status(404).json({ message: "User not found" })
    }

    const challenge = generateChallenge()
    req.session.challenge = challenge.toString("base64")

    const publicKeyCredentialCreationOptions = {
      challenge: challenge.toString("base64"),
      rp: {
        name: "Family Document Portal",
        id: process.env.NODE_ENV === "production" ? "familyportal.vercel.app" : "localhost",
      },
      user: {
        id: Buffer.from(user._id.toString()).toString("base64"),
        name: user.email,
        displayName: user.fullName,
      },
      pubKeyCredParams: [
        {
          alg: -7,
          type: "public-key",
        },
        {
          alg: -257,
          type: "public-key",
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "direct",
    }

    console.log(`✅ Biometric registration options generated for user: ${user.username}`)

    res.json({
      publicKeyCredentialCreationOptions,
      message: "Biometric registration options generated",
    })
  } catch (error) {
    console.error("❌ Biometric registration error:", error)
    res.status(500).json({ message: "Server error during biometric registration" })
  }
})

app.post("/api/auth/biometric/register/verify", requireAuth, async (req, res) => {
  try {
    const { credential } = req.body
    const user = await User.findById(req.session.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const credentialId = credential.id

    // Store credential ID as base64 string for consistency
    const credentialIdBase64 = Buffer.from(credential.rawId).toString("base64")

    await User.findByIdAndUpdate(user._id, {
      biometricEnabled: true,
      credentialId: credentialIdBase64, // Store as base64
      publicKey: JSON.stringify(credential.response), // Store public key data
    })

    console.log(`✅ Biometric registered successfully for user: ${user.username}`)
    console.log(`🔑 Credential ID stored: ${credentialIdBase64}`)

    res.json({
      message: "Biometric authentication registered successfully",
      verified: true,
    })
  } catch (error) {
    console.error("Biometric verification error:", error)
    res.status(500).json({ message: "Server error during biometric verification" })
  }
})

// LEGACY BIOMETRIC LOGIN (with username) - Keep for backward compatibility
app.post("/api/auth/biometric/login", async (req, res) => {
  try {
    const { username } = req.body

    console.log("🔐 Legacy biometric login request for username:", username)

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    })

    if (!user || !user.biometricEnabled) {
      console.log("❌ User not found or biometric not enabled")
      return res.status(400).json({ message: "Biometric authentication not available for this user" })
    }

    console.log("✅ User found with biometric enabled")
    console.log("🔑 Stored credential ID:", user.credentialId)

    const challenge = generateChallenge()

    req.session.challenge = challenge.toString("base64")
    req.session.pendingUserId = user._id.toString()

    const publicKeyCredentialRequestOptions = {
      challenge: challenge.toString("base64"),
      allowCredentials: [
        {
          id: user.credentialId, // Send as base64 string
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
    }

    console.log(`✅ Legacy biometric login options generated for user: ${user.username}`)
    console.log("📋 Options:", publicKeyCredentialRequestOptions)

    res.json({
      publicKeyCredentialRequestOptions,
      message: "Biometric login options generated",
    })
  } catch (error) {
    console.error("❌ Legacy biometric login error:", error)
    res.status(500).json({ message: "Server error during biometric login" })
  }
})

app.post("/api/auth/biometric/login/verify", async (req, res) => {
  try {
    const { credential } = req.body

    console.log("🔐 Biometric login verification")
    console.log("📋 Credential ID received:", credential.id)

    // Find user by credential ID (for immediate login)
    const credentialIdBase64 = Buffer.from(credential.rawId).toString("base64")
    console.log("🔍 Looking for user with credential ID:", credentialIdBase64)

    const user = await User.findOne({ credentialId: credentialIdBase64 })

    if (!user) {
      console.log("❌ No user found with this credential ID")
      return res.status(400).json({ message: "Invalid biometric credential" })
    }

    console.log(`✅ User identified: ${user.username}`)

    // Create session for the identified user
    req.session.userId = user._id
    req.session.userRole = user.role
    req.session.pendingUserId = null

    console.log(`✅ Biometric login successful for user: ${user.username}`)

    res.json({
      message: "Biometric login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        biometricEnabled: user.biometricEnabled,
      },
    })
  } catch (error) {
    console.error("Biometric login verification error:", error)
    res.status(500).json({ message: "Server error during biometric login verification" })
  }
})

app.get("/api/auth/biometric/status", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    res.json({
      biometricEnabled: user.biometricEnabled || false,
      credentialId: user.credentialId || null,
    })
  } catch (error) {
    console.error("Biometric status error:", error)
    res.status(500).json({ message: "Server error checking biometric status" })
  }
})

app.post("/api/auth/biometric/disable", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)

    await User.findByIdAndUpdate(user._id, {
      biometricEnabled: false,
      credentialId: null,
      publicKey: null,
    })

    console.log(`🔐 Biometric disabled for user: ${user.username}`)

    res.json({
      message: "Biometric authentication disabled successfully",
    })
  } catch (error) {
    console.error("Biometric disable error:", error)
    res.status(500).json({ message: "Server error disabling biometric authentication" })
  }
})

// ==================== DOCUMENT ROUTES ====================

app.post("/api/documents", requireAuth, upload.single("document"), async (req, res) => {
  try {
    console.log("=== DOCUMENT UPLOAD STARTED ===")
    console.log("User ID:", req.session.userId)
    console.log("Session ID:", req.sessionID)

    if (!req.file) {
      console.error("❌ UPLOAD ERROR: No file received from Multer")
      return res.status(400).json({ message: "No file uploaded or file type not allowed." })
    }

    const { category } = req.body

    if (!category) {
      console.error("❌ UPLOAD ERROR: Category missing")
      return res.status(400).json({ message: "Category is required" })
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const fileExtension = path.extname(req.file.originalname)
    const filename = "document-" + uniqueSuffix + fileExtension

    // Create file URL
    const baseUrl = process.env.BASE_URL || `https://${req.get("host")}`
    const fileUrl = `${baseUrl}/uploads/${filename}`

    console.log("🔗 Generated file URL:", fileUrl)

    const document = new Document({
      filename: filename,
      originalName: req.file.originalname,
      fileUrl: fileUrl,
      filePath: process.env.NODE_ENV === "production" ? null : req.file.path,
      fileData: process.env.NODE_ENV === "production" ? req.file.buffer : null,
      category,
      uploadedBy: req.session.userId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    })

    await document.save()
    await document.populate("uploadedBy", "username fullName")

    console.log("✅ Document saved successfully!")
    console.log("🆔 Document ID:", document._id)

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    })
  } catch (error) {
    console.error("❌ SERVER ERROR DURING UPLOAD:", error)
    res.status(500).json({ message: "Server error during upload", error: error.message })
  }
})

app.get("/api/documents", requireAuth, async (req, res) => {
  try {
    console.log("=== FETCHING DOCUMENTS ===")
    console.log("User ID:", req.session.userId)

    const { category, limit } = req.query
    const query = {}

    if (req.session.userRole !== "admin") {
      query.uploadedBy = req.session.userId
    }

    if (category) {
      query.category = category
    }

    let documentsQuery = Document.find(query).populate("uploadedBy", "username fullName").sort({ uploadDate: -1 })

    if (limit) {
      documentsQuery = documentsQuery.limit(Number.parseInt(limit))
    }

    const documents = await documentsQuery

    console.log("📊 Found", documents.length, "documents")

    res.json({ documents })
  } catch (error) {
    console.error("❌ ERROR FETCHING DOCUMENTS:", error)
    res.status(500).json({ message: "Server error while fetching documents" })
  }
})

app.delete("/api/documents/:id", requireAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    if (document.uploadedBy.toString() !== req.session.userId && req.session.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Delete file from local storage (development only)
    if (process.env.NODE_ENV !== "production" && document.filePath) {
      try {
        if (fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath)
          console.log("🗑️ File deleted from local storage")
        }
      } catch (fileError) {
        console.error("❌ Error deleting file from storage:", fileError)
      }
    }

    await Document.findByIdAndDelete(req.params.id)

    console.log(`✅ Document deleted successfully: ${document.originalName}`)

    res.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("❌ Delete error:", error)
    res.status(500).json({ message: "Server error during deletion" })
  }
})

// ==================== ADMIN ROUTES ====================

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error while fetching users" })
  }
})

app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalDocuments = await Document.countDocuments()
    const documentsByCategory = await Document.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])

    res.json({
      totalUsers,
      totalDocuments,
      documentsByCategory,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: "Server error while fetching stats" })
  }
})

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    availableRoutes: {
      auth: ["POST /api/auth/signup", "POST /api/auth/login", "POST /api/auth/logout", "GET /api/auth/me"],
      biometric: [
        "GET /api/auth/biometric/check-availability",
        "POST /api/auth/biometric/login/immediate",
        "POST /api/auth/biometric/register",
        "POST /api/auth/biometric/register/verify",
        "POST /api/auth/biometric/login",
        "POST /api/auth/biometric/login/verify",
        "GET /api/auth/biometric/status",
        "POST /api/auth/biometric/disable",
      ],
      documents: ["POST /api/documents", "GET /api/documents", "DELETE /api/documents/:id"],
      admin: ["GET /api/admin/users", "GET /api/admin/stats"],
      system: ["GET /", "GET /health", "GET /api/debug/session"],
    },
  })
})

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
  console.log(
    `🔗 Backend URL: ${process.env.NODE_ENV === "production" ? "https://familyportal-backend.vercel.app" : `http://localhost:${PORT}`}`,
  )
  console.log(`🔒 File storage: ${process.env.NODE_ENV === "production" ? "Database (MongoDB)" : "Local (Secure)"}`)
  console.log(`💾 Database: ${process.env.MONGODB_URI ? "MongoDB Atlas" : "Local MongoDB"}`)
  console.log(`🔐 Session store: MongoDB`)
  console.log(`🛡️ CORS enabled for Vercel domains`)
  console.log(`👆 Immediate biometric login enabled!`)
  console.log(`📊 All routes initialized successfully!`)
})

// Export for Vercel
module.exports = app
