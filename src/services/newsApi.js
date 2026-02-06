// GNews API direct fetch (for GitHub Pages compatibility)
// Get your free API key from: https://gnews.io

const API_KEY = import.meta.env.VITE_NEWS_API_KEY || "YOUR_API_KEY_HERE";
const API_BASE = "https://gnews.io/api/v4/search";

export const fetchNews = async (country = "in", category = "general", page = 1, searchTerm = "") => {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error(
      "API key not configured. Get a free GNews API key from https://gnews.io and add it to your .env file as VITE_NEWS_API_KEY"
    );
  }

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

    const params = new URLSearchParams({
      q: query,
      lang: "en",
      max: 20,
      page: page,
      token: API_KEY,
    });

    const url = `${API_BASE}?${params.toString()}`;
    console.log("Fetching from GNews API...");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    // Transform GNews response to match our app format
    const articles = (data.articles || []).map((article) => ({
      title: article.title,
      description: article.description,
      image: article.image,
      url: article.url,
      source: {
        name: article.source.name,
      },
      publishedAt: article.publishedAt,
      urlToImage: article.image,
    }));

    return articles;
  } catch (error) {
    console.error("News API Error:", error);
    throw error;
  }
};
