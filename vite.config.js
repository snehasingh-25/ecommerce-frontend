import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Local WhatsApp OG links: /og/* → backend
      '/og': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
