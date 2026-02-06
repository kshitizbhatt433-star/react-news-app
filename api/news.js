// Vercel Serverless Function - News API Proxy
// This keeps your API key secure on the backend
// Your GitHub Pages app calls this Vercel function instead

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q, page = "1", category = "general", country = "in" } = req.query;
    const API_KEY = process.env.GNEWS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "API key not configured on server. Contact admin.",
      });
    }

    // Build query
    let query = q;
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

    const newsUrl = `https://gnews.io/api/v4/search?${params.toString()}`;
    console.log("Fetching from GNews API:", query);

    const response = await fetch(newsUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("GNews API error:", data);
      return res.status(response.status).json({
        error: data.error || "Failed to fetch from News API",
      });
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

    // Add CORS headers for GitHub Pages
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json({
      success: true,
      articles: articles,
      totalArticles: data.totalArticles || articles.length,
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
}
