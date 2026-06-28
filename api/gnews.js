import { buildCategoryOptions, normalizePublishedAt, sanitizeUrl, isValidArticle, setCorsHeaders } from "./news-utils.js";

const API_KEY = process.env.GNEWS_API_KEY;
const SERVICE_NAME = "GNews";

export async function fetchGNewsArticles({ category, country, searchTerm, page = 1 }) {
  if (!API_KEY) {
    throw new Error("GNews key is not configured.");
  }

  const { query } = buildCategoryOptions(category, country, searchTerm);
  const params = new URLSearchParams({
    q: query || "top stories",
    lang: "en",
    max: "20",
    page: String(page),
    token: API_KEY,
  });

  const response = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `GNews request failed with ${response.status}`);
  }

  return (data.articles || [])
    .map((item) => ({
      id: item.url || item.title,
      title: item.title,
      description: item.description || item.content || "",
      image: item.image || item.urlToImage || null,
      source: { name: item.source?.name || SERVICE_NAME },
      category: category,
      publishedAt: normalizePublishedAt(item.publishedAt),
      url: sanitizeUrl(item.url),
    }))
    .filter(isValidArticle);
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "general", country = "in", page = "1", q = "" } = req.query;
    const articles = await fetchGNewsArticles({
      category,
      country,
      searchTerm: q,
      page: Number(page),
    });

    return res.status(200).json({ success: true, source: SERVICE_NAME, articles });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}