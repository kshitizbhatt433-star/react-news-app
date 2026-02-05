export async function handler(event) {
  try {
    console.log("🔹 news function called with params:", event.queryStringParameters);
    
    const { country = "in", category = "general", page = "1", q = "", health = "0" } = event.queryStringParameters || {};

    // Health check shortcut for deploy verification
    if (health === "1") {
      console.log("✅ Health check passed");
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, source: "news-function", version: "1.0" })
      };
    }

    const API_KEY = process.env.NEWS_API_KEY;
    console.log("🔑 API_KEY present:", !!API_KEY);
    
    if (!API_KEY) {
      console.error("❌ NEWS_API_KEY environment variable is not set!");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "NEWS_API_KEY not set in environment" })
      };
    }

    let query = country === "in" ? (q || (category === "general" ? "india" : `india ${category}`)) : q || category || "news";

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=40&page=${page}&token=${API_KEY}`;
    console.log("📡 Fetching from:", url.replace(API_KEY, "***HIDDEN***"));

    const response = await fetch(url);
    console.log("📊 API response status:", response.status);
    
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API error:", data);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data.error || "News API error" })
      };
    }

    console.log("✅ Success! Got", data.articles?.length || 0, "articles");
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error("❌ Function error:", err.message, err.stack);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch news: " + err.message })
    };
  }
}
