export async function handler(event) {
  try {
    const { country = "in", category = "general", page = "1", q = "", health = "0" } = event.queryStringParameters || {};

    // Health check shortcut for deploy verification
    if (health === "1") {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, source: "news-function", version: "1.0" })
      };
    }

    const API_KEY = process.env.NEWS_API_KEY; // set in Netlify env
    if (!API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "NEWS_API_KEY not set" }) };
    }

    let query = country === "in" ? (q || (category === "general" ? "india" : `india ${category}`)) : q || category || "news";

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=40&page=${page}&token=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch news" })
    };
  }
}
