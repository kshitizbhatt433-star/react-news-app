import { fetchGNews } from "./gnews";
import { fetchNewsData } from "./newsdata";
import { fetchTheNewsApi } from "./thenewsapi";

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 2;

const envStatus = {
  GNEWS_API_KEY: Boolean(import.meta.env.GNEWS_API_KEY || import.meta.env.VITE_GNEWS_API_KEY || process?.env?.GNEWS_API_KEY || process?.env?.VITE_GNEWS_API_KEY),
  NEWSDATA_API_KEY: Boolean(import.meta.env.NEWSDATA_API_KEY || import.meta.env.VITE_NEWSDATA_API_KEY || process?.env?.NEWSDATA_API_KEY || process?.env?.VITE_NEWSDATA_API_KEY),
  THENEWSAPI_KEY: Boolean(import.meta.env.THENEWSAPI_KEY || import.meta.env.VITE_THENEWSAPI_KEY || process?.env?.THENEWSAPI_KEY || process?.env?.VITE_THENEWSAPI_KEY),
};
console.log("Environment key status:", {
  GNEWS_API_KEY: envStatus.GNEWS_API_KEY ? "Available" : "Missing",
  NEWSDATA_API_KEY: envStatus.NEWSDATA_API_KEY ? "Available" : "Missing",
  THENEWSAPI_KEY: envStatus.THENEWSAPI_KEY ? "Available" : "Missing",
});

export async function fetchNews(category = "general", country = "in", page = 1, searchTerm = "") {
  const cacheKey = `${category}|${country}|${page}|${searchTerm}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.value;
  }

  const sources = [
    { name: "NewsData.io", fn: fetchNewsData },
    { name: "GNews", fn: fetchGNews },
    { name: "TheNewsAPI", fn: fetchTheNewsApi },
  ];

  const articles = [];
  const errors = [];

  for (const source of sources) {
    try {
      const result = await source.fn(category, country, page, searchTerm);
      if (Array.isArray(result) && result.length > 0) {
        articles.push(...result);
      }
    } catch (error) {
      errors.push(`${source.name}: ${error?.message || "Request failed"}`);
    }
  }

  if (articles.length === 0) {
    const message = errors.length
      ? errors.join(" | ")
      : "No news available. Please try again later.";
    throw new Error(message);
  }

  const consolidated = dedupeAndSortArticles(articles);
  cache.set(cacheKey, { value: consolidated, ts: Date.now() });
  return consolidated;
}

export async function retryFetchNews(category = "general", country = "in", page = 1, searchTerm = "") {
  const cacheKey = `${category}|${country}|${page}|${searchTerm}`;
  cache.delete(cacheKey);
  return fetchNews(category, country, page, searchTerm);
}

function parsePublishedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function dedupeAndSortArticles(articles = []) {
  const seen = new Map();

  const normalized = articles
    .map((article) => ({
      ...article,
      title: article.title?.trim(),
      url: article.url?.trim(),
      publishedAt: parsePublishedAt(article.publishedAt),
    }))
    .filter((article) => article.title && article.url);

  for (const article of normalized) {
    const key = `${article.title.toLowerCase()}|${article.url}`;
    if (!seen.has(key)) {
      seen.set(key, article);
    }
  }

  return Array.from(seen.values()).sort((a, b) => {
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
