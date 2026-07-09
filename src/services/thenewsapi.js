const getEnvKey = (name) => {
  const value = import.meta.env[name] || import.meta.env[`VITE_${name}`] || process?.env?.[name] || process?.env?.[`VITE_${name}`];
  console.log(`${name}:`, value ? "Available" : "Missing");
  return value;
};

const API_KEY = getEnvKey("THENEWSAPI_KEY");
const SERVICE_NAME = "TheNewsAPI";

const CATEGORY_SEARCH = {
  general: "top stories",
  india: "india news",
  world: "world news",
  defense: "defense OR military OR armed forces OR war OR army OR navy OR air force OR missile OR border security OR geopolitics OR national security",
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
  return {
    query: term || CATEGORY_SEARCH[categoryKey] || CATEGORY_SEARCH.general,
    categoryParam: term
      ? null
      : ["politics", "business", "technology", "sports", "entertainment", "science", "health"].includes(categoryKey)
      ? categoryKey
      : null,
    countryParam: categoryKey === "india" || categoryKey === "bollywood" || country === "in" ? "in" : null,
    category: categoryKey,
  };
}

function normalizeArticle(item, category = "general") {
  return {
    id: item.url || item.guid || item.title || `${item.source}-${item.published_at}`,
    title: item.title || "Untitled",
    description: item.description || item.summary || "",
    image: item.image_url || item.image || null,
    source: { name: item.source || item.source?.name || SERVICE_NAME },
    category,
    publishedAt: item.published_at || item.publishedAt || item.pubDate || null,
    url: item.url || item.link || null,
  };
}

export async function fetchTheNewsApi(category = "general", country = "in", page = 1, searchTerm = "") {
  if (!API_KEY) {
    throw new Error("THENEWSAPI_KEY is not configured.");
  }

  const { query, categoryParam, countryParam, category: normalizedCategory } = buildParams(category, country, searchTerm);
  const params = new URLSearchParams({
    api_token: API_KEY,
    language: "en",
    page: String(page),
    limit: "20",
  });

  if (query) params.set("q", query);
  if (categoryParam) params.set("categories", categoryParam);
  if (countryParam) params.set("countries", countryParam.toUpperCase());

  const response = await fetch(`https://api.thenewsapi.com/v1/news/all?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `${SERVICE_NAME} request failed.`);
  }

  const items = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.articles)
    ? data.articles
    : [];

  return items.map((article) => normalizeArticle(article, normalizedCategory)).filter((item) => item.url && item.title);
}
