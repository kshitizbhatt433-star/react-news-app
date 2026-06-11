import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY'])

  // Prefer runtime process.env (set by CI) and fall back to values loaded from .env files
  const GNEWS = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY || env.GNEWS_API_KEY || env.VITE_GNEWS_API_KEY || ''
  const NEWSDATA = process.env.NEWSDATA_API_KEY || process.env.VITE_NEWSDATA_API_KEY || env.NEWSDATA_API_KEY || env.VITE_NEWSDATA_API_KEY || ''

  return defineConfig({
    base: '/react-news-app/',
    envPrefix: ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY'],
    define: {
      'import.meta.env.GNEWS_API_KEY': JSON.stringify(GNEWS),
      'import.meta.env.NEWSDATA_API_KEY': JSON.stringify(NEWSDATA),
      'import.meta.env.VITE_GNEWS_API_KEY': JSON.stringify(GNEWS),
      'import.meta.env.VITE_NEWSDATA_API_KEY': JSON.stringify(NEWSDATA),
    },
    plugins: [react()],
  })
}
