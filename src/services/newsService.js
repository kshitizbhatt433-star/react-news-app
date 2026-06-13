// ─────────────────────────────────────────────────────────────────
// newsService.js — the ONLY news file the frontend uses
// All API calls go to /api/news (Vercel serverless function)
// No API keys ever touch the browser
// ─────────────────────────────────────────────────────────────────

const CACHE = new Map();
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

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

  const response = await fetch(`/api/news?${params.toString()}`);

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