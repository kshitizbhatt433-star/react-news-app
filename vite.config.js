import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY'])

  return defineConfig({
    base: '/react-news-app/',
    envPrefix: ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY'],
    define: {
      'import.meta.env.GNEWS_API_KEY': JSON.stringify(env.GNEWS_API_KEY),
      'import.meta.env.NEWSDATA_API_KEY': JSON.stringify(env.NEWSDATA_API_KEY),
      'import.meta.env.VITE_GNEWS_API_KEY': JSON.stringify(env.VITE_GNEWS_API_KEY),
      'import.meta.env.VITE_NEWSDATA_API_KEY': JSON.stringify(env.VITE_NEWSDATA_API_KEY),
    },
    plugins: [react()],
  })
}
