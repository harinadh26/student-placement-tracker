import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
  allowedHosts: ['industrious-tenderness-production-ef0b.up.railway.app']
}
})
