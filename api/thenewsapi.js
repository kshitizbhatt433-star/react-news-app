import { buildCategoryOptions, normalizePublishedAt, sanitizeUrl, isValidArticle, setCorsHeaders } from "./news-utils.js";

const SERVICE_NAME = "TheNewsAPI";

export async function fetchTheNewsApiArticles({ category, country, searchTerm, page = 1 }) {
  const API_KEY = process.env.THENEWSAPI_KEY;
  if (!API_KEY) throw new Error("THENEWSAPI_KEY is not set in environment variables.");

  const { query, theNewsCategory, countryParam } = buildCategoryOptions(category, country, searchTerm);
  const params = new URLSearchParams({
    api_token: API_KEY,
    language: "en",
    page: String(page),
    limit: "20",
  });
  if (theNewsCategory) params.set("categories", theNewsCategory);
  if (countryParam) params.set("countries", countryParam.toUpperCase());
  if (query) params.set("q", query);

  const response = await fetch(`https://api.thenewsapi.com/v1/news/all?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) throw new Error(data?.message || `TheNewsAPI failed with ${response.status}`);

  const items = Array.isArray(data.data) ? data.data : [];
  return items
    .map((item) => ({
      id: item.url || item.title,
      title: item.title,
      description: item.description || item.summary || "",
      image: item.image_url || item.image || null,
      source: { name: typeof item.source === "string" ? item.source : item.source?.name || SERVICE_NAME },
      category,
      publishedAt: normalizePublishedAt(item.published_at || item.publishedAt),
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
    const articles = await fetchTheNewsApiArticles({ category, country, searchTerm: q, page: Number(page) });
    return res.status(200).json({ success: true, source: SERVICE_NAME, articles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}