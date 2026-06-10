const CATEGORY_CONFIG = {
  general: {
    q: "top stories",
    newsDataCategory: null,
    theNewsCategory: null,
    countryParam: null,
  },
  india: {
    q: "india news",
    newsDataCategory: null,
    theNewsCategory: null,
    countryParam: "in",
  },
  world: {
    q: "world news",
    newsDataCategory: null,
    theNewsCategory: null,
    countryParam: null,
  },
  politics: {
    q: null,
    newsDataCategory: "politics",
    theNewsCategory: "politics",
    countryParam: null,
  },
  business: {
    q: null,
    newsDataCategory: "business",
    theNewsCategory: "business",
    countryParam: null,
  },
  technology: {
    q: null,
    newsDataCategory: "technology",
    theNewsCategory: "technology",
    countryParam: null,
  },
  sports: {
    q: null,
    newsDataCategory: "sports",
    theNewsCategory: "sports",
    countryParam: null,
  },
  entertainment: {
    q: null,
    newsDataCategory: "entertainment",
    theNewsCategory: "entertainment",
    countryParam: null,
  },
  bollywood: {
    q: "bollywood",
    newsDataCategory: null,
    theNewsCategory: null,
    countryParam: "in",
  },
  science: {
    q: null,
    newsDataCategory: "science",
    theNewsCategory: "science",
    countryParam: null,
  },
  health: {
    q: null,
    newsDataCategory: "health",
    theNewsCategory: "health",
    countryParam: null,
  },
};

export function buildCategoryOptions(category = "general", country = "in", searchTerm = "") {
  const normalizedCategory = category?.toLowerCase() || "general";
  const config = CATEGORY_CONFIG[normalizedCategory] || CATEGORY_CONFIG.general;
  const query = searchTerm?.trim() || config.q || "";
  return {
    categoryKey: normalizedCategory,
    query,
    newsDataCategory: query ? null : config.newsDataCategory,
    theNewsCategory: query ? null : config.theNewsCategory,
    countryParam: normalizedCategory === "india" || normalizedCategory === "bollywood" ? "in" : config.countryParam || (country === "in" ? "in" : null),
  };
}

export function normalizePublishedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return null;
  return url.trim();
}

export function isValidArticle(article) {
  return Boolean(article && article.title && article.url);
}

export function dedupeAndSortArticles(articles = []) {
  const seen = new Map();
  const normalized = articles
    .map((article) => ({
      ...article,
      title: article.title?.trim(),
      url: sanitizeUrl(article.url),
      publishedAt: normalizePublishedAt(article.publishedAt),
    }))
    .filter((article) => article.title && article.url);

  normalized.forEach((article) => {
    const key = `${article.title.toLowerCase()}|${article.url}`;
    if (!seen.has(key)) {
      seen.set(key, article);
    }
  });

  return Array.from(seen.values()).sort((a, b) => {
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
}
