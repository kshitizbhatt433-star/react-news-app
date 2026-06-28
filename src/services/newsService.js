// ─────────────────────────────────────────────────────────────────
// newsService.js — the ONLY news file the frontend uses
// On Vercel: calls its own /api/news (relative, same origin)
// On GitHub Pages: calls the Vercel-hosted /api/news (absolute URL),
//   since GitHub Pages can't run serverless functions itself
// No API keys ever touch the browser
// ─────────────────────────────────────────────────────────────────

const CACHE = new Map();
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

// Set this to your real Vercel deployment URL.
const VERCEL_API_BASE = "https://react-news-app-sandy.vercel.app";

const isGhPages = typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
const API_BASE = isGhPages ? VERCEL_API_BASE : "";

export async function fetchNews(category = "general", country = "in", page = 1, searchTerm = "") {
  const cacheKey = `${category}|${country}|${page}|${searchTerm}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.value;

  const params = new URLSearchParams({
    category,
    country,
    page: String(page),
    q: searchTerm || "",
  });

  const response = await fetch(`${API_BASE}/api/news?${params.toString()}`);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("News server returned an invalid response.");
  }

  if (!response.ok || data.success !== true) {
    throw new Error(data?.error || `News request failed (${response.status}).`);
  }

  const articles = data.articles || [];
  CACHE.set(cacheKey, { value: articles, ts: Date.now() });
  return articles;
}

export async function retryFetchNews(category = "general", country = "in", page = 1, searchTerm = "") {
  CACHE.delete(`${category}|${country}|${page}|${searchTerm}`);
  return fetchNews(category, country, page, searchTerm);
}