import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Backend principal NestJS.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Servidor Express propio del admin-app (admin-api).
      '/admin-api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
