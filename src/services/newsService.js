const NEWS_API_ENDPOINT = "/api/news";
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 1;

const buildUrl = ({ category = "general", country = "in", page = 1, searchTerm = "" }) => {
  const params = new URLSearchParams({
    category,
    country,
    page: String(page),
  });

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  return `${NEWS_API_ENDPOINT}?${params.toString()}`;
};

export async function fetchNews(category = "general", country = "in", page = 1, searchTerm = "") {
  const cacheKey = `${category}|${country}|${page}|${searchTerm}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.value;
  }

  const response = await fetch(buildUrl({ category, country, page, searchTerm }));
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to fetch news.");
  }

  const articles = data.articles || [];
  cache.set(cacheKey, { value: articles, ts: Date.now() });
  return articles;
}

export async function retryFetchNews(category, country, page, searchTerm) {
  cache.delete(`${category}|${country}|${page}|${searchTerm}`);
  return fetchNews(category, country, page, searchTerm);
}
