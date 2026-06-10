import { buildCategoryOptions, normalizePublishedAt, sanitizeUrl, isValidArticle, setCorsHeaders } from "./news-utils.js";

const API_KEY = process.env.THENEWSAPI_KEY;
const SERVICE_NAME = "TheNewsAPI";

export async function fetchTheNewsApiArticles({ category, country, searchTerm, page = 1 }) {
  if (!API_KEY) {
    throw new Error("TheNewsAPI key is not configured.");
  }

  const { query, theNewsCategory, countryParam } = buildCategoryOptions(category, country, searchTerm);
  const params = new URLSearchParams({
    api_token: API_KEY,
    language: "en",
    page: String(page),
    limit: "20",
  });

  if (theNewsCategory) {
    params.set("categories", theNewsCategory);
  }
  if (countryParam) {
    params.set("countries", countryParam.toUpperCase());
  }
  if (query) {
    params.set("q", query);
  }

  const response = await fetch(`https://api.thenewsapi.com/v1/news/all?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `TheNewsAPI request failed with ${response.status}`);
  }

  const items = Array.isArray(data.data) ? data.data : Array.isArray(data.articles) ? data.articles : [];
  return items
    .map((item) => ({
      id: item.url || item.guid || item.title,
      title: item.title,
      description: item.description || item.summary || "",
      image: item.image_url || item.image || null,
      source: { name: item.source || item.source?.name || SERVICE_NAME },
      category: category,
      publishedAt: normalizePublishedAt(item.published_at || item.pubDate || item.publishedAt),
      url: sanitizeUrl(item.url || item.link),
    }))
    .filter(isValidArticle);
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "general", country = "in", page = "1", q = "" } = req.query;
    const articles = await fetchTheNewsApiArticles({
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
