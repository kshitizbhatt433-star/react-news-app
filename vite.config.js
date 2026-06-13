import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // No base — Vercel serves from root
  // No API keys — they live only in Vercel env vars, accessed by /api/* functions
})