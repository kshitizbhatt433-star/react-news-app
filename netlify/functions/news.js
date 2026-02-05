exports.handler = async (event) => {
  console.log("news function invoked");
  
  try {
    const queryParams = event.queryStringParameters || {};
    const country = queryParams.country || "in";
    const category = queryParams.category || "general";
    const page = queryParams.page || "1";
    const q = queryParams.q || "";
    const health = queryParams.health || "0";

    // Health check
    if (health === "1") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, status: "Function is live" })
      };
    }

    const API_KEY = process.env.NEWS_API_KEY;
    console.log("NEWS_API_KEY exists:", !!API_KEY);
    
    if (!API_KEY) {
      console.error("ERROR: NEWS_API_KEY not set in environment variables");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    let query = country === "in" ? (q || (category === "general" ? "india" : "india " + category)) : (q || category || "news");
    const url = "https://gnews.io/api/v4/search?q=" + encodeURIComponent(query) + "&lang=en&max=40&page=" + page + "&token=" + API_KEY;
    
    console.log("Calling news API...");
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("API error:", data);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data.error || "API call failed" })
      };
    }

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
