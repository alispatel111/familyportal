import React from "react"
import ReactDOM from "react-dom/client"
import "./styles/variables.css"
import "./App.css"
import App from "./App.jsx"
// import "./index.css"
import axios from "axios"

// Configure axios for production
axios.defaults.withCredentials = true

// Always use the deployed backend URL - NO localhost
const API_BASE_URL = "https://familyportal-backend.vercel.app"
axios.defaults.baseURL = API_BASE_URL

console.log("🔗 API Base URL:", axios.defaults.baseURL)
console.log("🌍 Environment:", import.meta.env.MODE)

// Add request interceptor for better error handling
axios.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    // Ensure credentials are always sent
    config.withCredentials = true
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.status, error.response?.data)

    // Handle specific error cases
    if (error.code === "ERR_NETWORK") {
      console.error("🌐 Network Error: Check if backend is accessible")
      console.error("🔗 Trying to connect to:", axios.defaults.baseURL)
    }
    if (error.response?.status === 404) {
      console.error("🔍 404 Error: API endpoint not found")
    }
    if (error.response?.status === 401) {
      console.error("🔐 401 Error: Authentication required")
    }

    return Promise.reject(error)
  },
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
