const API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '';
const SERVICE_NAME = "GNews";

const CATEGORY_SEARCH = {
  general: "top stories",
  india: "india news",
  world: "world news",
  politics: "politics news",
  business: "business news",
  technology: "technology news",
  sports: "sports news",
  entertainment: "entertainment news",
  bollywood: "bollywood news",
  science: "science news",
  health: "health news",
};

function buildQuery(category = "general", country = "in", searchTerm = "") {
  const categoryKey = (category || "general").toLowerCase();
  const term = searchTerm?.trim();
  if (term) return term;
  return CATEGORY_SEARCH[categoryKey] || CATEGORY_SEARCH.general;
}

function normalizeArticle(item, category = "general") {
  return {
    id: item.url || item.title || `${item.source?.name || SERVICE_NAME}-${item.publishedAt}`,
    title: item.title || "Untitled",
    description: item.description || item.content || "",
    image: item.image || null,
    source: { name: item.source?.name || SERVICE_NAME },
    category,
    publishedAt: item.publishedAt || null,
    url: item.url || null,
  };
}

export async function fetchGNews(category = "general", country = "in", page = 1, searchTerm = "") {
  if (!API_KEY) {
    throw new Error("GNEWS_API_KEY is not configured.");
  }

  const query = buildQuery(category, country, searchTerm);
  const params = new URLSearchParams({
    q: query,
    lang: "en",
    max: "20",
    token: API_KEY,
  });

  if (country === "in") {
    params.set("country", "in");
  }

  const response = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `${SERVICE_NAME} request failed.`);
  }

  return (data.articles || []).map((article) => normalizeArticle(article, category));
}
