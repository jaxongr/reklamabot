import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build natijasi backend tomonidan serve qilinadi (express static)
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    port: 5180,
    proxy: {
      '/api': { target: 'http://localhost:4025', changeOrigin: true },
    },
  },
})
