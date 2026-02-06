// GNews API Service with Vercel Proxy
// In production: calls Vercel serverless function (keeps API key secure)
// In development: calls GNews API directly

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const VERCEL_URL = "https://react-news-c6w7wui8n-harrybhatts-projects.vercel.app";
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

    // Use Vercel proxy in production, direct API in development
    const endpoint = IS_PRODUCTION 
      ? `${VERCEL_URL}/api/news?q=${encodeURIComponent(query)}&page=${page}&category=${category}&country=${country}`
      : buildDirectApiUrl(query, page, country, category);

    console.log("Fetching from:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const articles = data.articles || [];
    console.log(`Successfully fetched ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error("News API Error:", error);
    throw error;
  }
};

// Direct API call for development (requires VITE_NEWS_API_KEY in .env.local)
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
