import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import axios from "axios"

// Configure axios for production
axios.defaults.withCredentials = true

// Directly set the API Base URL to your deployed backend URL
// This ensures it always points to the Vercel backend in any environment
axios.defaults.baseURL = "https://familyportal-backend.vercel.app" // <-- Yahan tumhara deployed backend URL hai

console.log("🔗 API Base URL:", axios.defaults.baseURL)

// Add request interceptor for better error handling
axios.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
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
    return Promise.reject(error)
  },
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
