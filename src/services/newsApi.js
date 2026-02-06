// GNews API Service with Vercel Proxy
// In production: calls Vercel serverless function (keeps API key secure)
// In development: calls GNews API directly

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const VERCEL_URL = "https://headlinenewsx-app.vercel.app";
const IS_PRODUCTION = import.meta.env.MODE === "production";

export const fetchNews = async (country = "in", category = "general", page = 1, searchTerm = "") => {
  try {
    // Build query
    let query = searchTerm;
    if (!query) {
      if (category === "general") {
        query = country === "in" ? "india news" : "world news";
      } else {
        query = `${category} ${country === "in" ? "india" : ""}`.trim();
      }
    }

    // Try Vercel first in production, fallback to direct API
    let articles = [];
    let useDirectApi = false;

    if (IS_PRODUCTION) {
      try {
        console.log("Trying Vercel backend...");
        articles = await fetchFromVercel(query, page, category, country);
      } catch (vercelError) {
        console.warn("Vercel failed, trying direct API...", vercelError);
        useDirectApi = true;
      }
    } else {
      useDirectApi = true;
    }

    // Fallback to direct API
    if (useDirectApi) {
      articles = await fetchDirectFromGNews(query, page);
    }

    console.log(`Successfully fetched ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error("News API Error:", error);
    throw error;
  }
};

// Fetch from Vercel backend
const fetchFromVercel = async (query, page, category, country) => {
  const endpoint = `${VERCEL_URL}/api/news?q=${encodeURIComponent(query)}&page=${page}&category=${category}&country=${country}`;
  console.log("Vercel endpoint:", endpoint);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`Vercel HTTP Error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.articles || [];
};

// Direct GNews API call (fallback)
const fetchDirectFromGNews = async (query, page) => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    throw new Error(
      "API key not configured. Please set VITE_NEWS_API_KEY in .env.local"
    );
  }

  const params = new URLSearchParams({
    q: query,
    lang: "en",
    max: 20,
    page: page,
    token: API_KEY,
  });

  const url = `https://gnews.io/api/v4/search?${params.toString()}`;
  console.log("Using direct GNews API (fallback)");

  const response = await fetch(url, {
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  // Transform response
  const articles = (data.articles || []).map((article) => ({
    title: article.title,
    description: article.description,
    image: article.image,
    url: article.url,
    source: {
      name: article.source?.name || "Unknown",
    },
    publishedAt: article.publishedAt,
    urlToImage: article.image,
  }));

  return articles;
};

// Direct API call for development
const buildDirectApiUrl = (query, page, country, category) => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    throw new Error(
      "Development mode: Set VITE_NEWS_API_KEY in .env.local. Get it from https://gnews.io/register"
    );
  }

  const params = new URLSearchParams({
    q: query,
    lang: "en",
    max: 20,
    page: page,
    token: API_KEY,
  });

  return `https://gnews.io/api/v4/search?${params.toString()}`;
};
