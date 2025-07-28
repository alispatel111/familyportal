import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import axios from "axios"

// Configure axios for production
axios.defaults.withCredentials = true

// Determine the API base URL
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // In production, use the backend Vercel URL
  if (import.meta.env.PROD) {
    return "https://family-portal-backend.vercel.app"
  }

  // In development, use localhost
  return "http://localhost:5000"
}

axios.defaults.baseURL = getApiBaseUrl()

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
