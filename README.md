# OSINT India

An advanced open-source intelligence platform for news analysis, live updates, and investigative journalism focused on India and global events.

## Features

- Live news from YouTube channels (Aaj Tak, BBC India, etc.)
- News aggregation from Reddit, RSS feeds, and GNews
- Interactive India map for regional news
- OSINT tools: keyword tracking, source analysis, data visualization
- Detective-themed interface with dark mode
- Real-time search and filtering
- Social sharing and bookmarking

## Tech Stack

- React 19 + Vite
- Multiple APIs: YouTube, GNews, Reddit, RSS
- Interactive maps with GeoJSON
- Responsive design

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Add API keys to `.env.local`:
   - `VITE_NEWS_API_KEY` (GNews)
   - `VITE_YOUTUBE_API_KEY` (YouTube)
4. Run development server: `npm run dev`

## Deployment

Deployed on Vercel with Netlify functions for API proxying.
