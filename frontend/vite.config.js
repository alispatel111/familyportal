import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No proxy needed - using deployed backend directly
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          axios: ["axios"],
        },
      },
    },
  },
  define: {
    // Ensure no localhost references in build
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
  },
})
