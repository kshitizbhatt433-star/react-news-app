import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GH_PAGES=true is set only in the GitHub Actions workflow.
// Vercel builds normally with no base (serves from root).
const isGhPages = process.env.GH_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGhPages ? '/react-news-app/' : '/',
})