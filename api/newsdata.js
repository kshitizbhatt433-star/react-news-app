import { buildCategoryOptions, normalizePublishedAt, sanitizeUrl, isValidArticle, setCorsHeaders } from "./news-utils.js";

const API_KEY = process.env.NEWSDATA_API_KEY;
const SERVICE_NAME = "NewsData.io";

export async function fetchNewsDataArticles({ category, country, searchTerm, page = 1 }) {
  if (!API_KEY) {
    throw new Error("NewsData.io key is not configured.");
  }

  const { query, newsDataCategory, countryParam } = buildCategoryOptions(category, country, searchTerm);
  const params = new URLSearchParams({
    apikey: API_KEY,
    language: "en",
    page: String(page),
    q: query || undefined,
  });

  if (newsDataCategory) {
    params.set("category", newsDataCategory);
  }
  if (countryParam) {
    params.set("country", countryParam);
  }

  const response = await fetch(`https://newsdata.io/api/1/news?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || `NewsData.io request failed with ${response.status}`);
  }

  const items = Array.isArray(data.results) ? data.results : [];
  return items
    .map((item) => ({
      id: item.link || item.title,
      title: item.title,
      description: item.description || item.content || "",
      image: item.image_url || item.enclosure_url || null,
      source: { name: item.source_id || SERVICE_NAME },
      category: category,
      publishedAt: normalizePublishedAt(item.pubDate || item.pubDateTime || item.pub_date),
      url: sanitizeUrl(item.link),
    }))
    .filter(isValidArticle);
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "general", country = "in", page = "1", q = "" } = req.query;
    const articles = await fetchNewsDataArticles({
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
