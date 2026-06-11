import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY', 'THENEWSAPI_KEY'])

  return defineConfig({
    base: '/react-news-app/',
    envPrefix: ['VITE_', 'GNEWS_API_KEY', 'NEWSDATA_API_KEY', 'THENEWSAPI_KEY'],
    define: {
      'process.env.GNEWS_API_KEY': JSON.stringify(env.GNEWS_API_KEY),
      'process.env.NEWSDATA_API_KEY': JSON.stringify(env.NEWSDATA_API_KEY),
      'process.env.THENEWSAPI_KEY': JSON.stringify(env.THENEWSAPI_KEY),
      'process.env.VITE_GNEWS_API_KEY': JSON.stringify(env.VITE_GNEWS_API_KEY),
      'process.env.VITE_NEWSDATA_API_KEY': JSON.stringify(env.VITE_NEWSDATA_API_KEY),
      'process.env.VITE_THENEWSAPI_KEY': JSON.stringify(env.VITE_THENEWSAPI_KEY),
    },
    plugins: [react()],
  })
}
