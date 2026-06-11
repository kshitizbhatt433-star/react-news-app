const API_KEY = import.meta.env.NEWSDATA_API_KEY || import.meta.env.VITE_NEWSDATA_API_KEY || process?.env?.NEWSDATA_API_KEY || process?.env?.VITE_NEWSDATA_API_KEY || '';
const SERVICE_NAME = "NewsData.io";

const CATEGORY_SEARCH = {
  general: "top stories",
  india: "india news",
  world: "world news",
  politics: "politics",
  business: "business",
  technology: "technology",
  sports: "sports",
  entertainment: "entertainment",
  bollywood: "bollywood",
  science: "science",
  health: "health",
};

function buildParams(category = "general", country = "in", searchTerm = "") {
  const categoryKey = (category || "general").toLowerCase();
  const term = searchTerm?.trim();
  const normalizedCategory = CATEGORY_SEARCH[categoryKey] ? categoryKey : "general";
  return {
    query: term || CATEGORY_SEARCH[normalizedCategory],
    categoryParam: term ? null : ["politics", "business", "technology", "sports", "entertainment", "science", "health"].includes(normalizedCategory)
      ? normalizedCategory
      : null,
    countryParam: normalizedCategory === "india" || normalizedCategory === "bollywood" ? "in" : country === "in" ? "in" : null,
    category: normalizedCategory,
  };
}

function normalizeArticle(item, category = "general") {
  return {
    id: item.link || item.guid || item.title || `${item.source_id}-${item.pubDate}`,
    title: item.title || "Untitled",
    description: item.description || item.summary || "",
    image: item.image_url || item.image || null,
    source: { name: item.source_id || item.source?.name || SERVICE_NAME },
    category,
    publishedAt: item.pubDate || item.pubDate || item.pubDate || null,
    url: item.link || item.guid || null,
  };
}

export async function fetchNewsData(category = "general", country = "in", page = 1, searchTerm = "") {
  if (!API_KEY) {
    throw new Error("NEWSDATA_API_KEY is not configured.");
  }

  const { query, categoryParam, countryParam, category: normalizedCategory } = buildParams(category, country, searchTerm);
  const params = new URLSearchParams({
    apikey: API_KEY,
    language: "en",
    page: String(page),
  });

  if (query) params.set("q", query);
  if (categoryParam) params.set("category", categoryParam);
  if (countryParam) params.set("country", countryParam);

  const response = await fetch(`https://newsdata.io/api/1/news?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.msg || `${SERVICE_NAME} request failed.`);
  }

  return (data.results || []).map((article) => normalizeArticle(article, normalizedCategory));
}
