import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-ui",
              test: /[\\/]node_modules[\\/](radix-ui|@radix-ui|framer-motion|lucide-react|clsx|tailwind-merge)[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})
