// netlify/functions/news.js

export async function handler(event) {
  try {
    const { country = "in", category = "general", page = "1", q = "" } = event.queryStringParameters || {};

    // 🔑 Use your Netlify environment variable
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "NEWS_API_KEY not set in environment variables" })
      };
    }

    // Build query for GNews
    let query = "";
    if (country === "in") {
      query = q || (category === "general" ? "india" : `india ${category}`);
    } else {
      query = q || category || "news";
    }

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&max=40&page=${page}&token=${API_KEY}`;

    // Fetch news from GNews
    const response = await fetch(url);
    const data = await response.json();

    // Return result with CORS header
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // allows your frontend to call this API
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error("Netlify function error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to fetch news" })
    };
  }
}
