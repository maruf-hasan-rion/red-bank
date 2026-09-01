import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth"],
          stripe: ["@stripe/react-stripe-js", "@stripe/stripe-js"],
          pdf: ["html2pdf.js"],
          editor: ["jodit-react"],
          query: ["@tanstack/react-query"],
          motion: ["motion"],
          icons: ["react-icons", "lucide-react"],
        },
      },
    },
  },
})
