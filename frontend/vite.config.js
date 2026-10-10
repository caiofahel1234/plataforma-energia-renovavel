import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:3000' } }, // dev: mesmo "site" => cookie SameSite=Strict funciona, sem CORS
  build: { sourcemap: false },
})
