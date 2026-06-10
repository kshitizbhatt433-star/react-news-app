// api/reddit.js
// Vercel Serverless Function — Reddit Proxy
// Fetches posts from any subreddit without exposing anything sensitive
// Reddit's public JSON API doesn't need an API key

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { subreddit = "india", sort = "hot", limit = "20" } = req.query;

    // Whitelist allowed subreddits for safety
    const ALLOWED_SUBREDDITS = [
      "india", "worldnews", "technology", "science",
      "sports", "cricket", "bollywood", "business",
      "IndiaSpeaks", "indiadiscussion", "AskIndia",
      "tech", "programming", "entertainment",
    ];

    if (!ALLOWED_SUBREDDITS.includes(subreddit)) {
      return res.status(400).json({ error: "Subreddit not allowed" });
    }

    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${Math.min(Number(limit), 50)}`;
    console.log("Fetching Reddit:", url);

    const response = await fetch(url, {
      headers: {
        // Reddit requires a User-Agent
        "User-Agent": "HeadlineX-NewsApp/1.0",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Reddit API error: ${response.status}` });
    }

    const data = await response.json();
    const children = data?.data?.children || [];

    const posts = children
      .map((c) => c.data)
      .filter((p) => !p.stickied && p.title)
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.selftext?.substring(0, 200) || null,
        url: p.url,
        permalink: `https://reddit.com${p.permalink}`,
        image: p.thumbnail?.startsWith("http") ? p.thumbnail : null,
        source: { name: `r/${p.subreddit}` },
        author: p.author,
        score: p.score,
        numComments: p.num_comments,
        publishedAt: new Date(p.created_utc * 1000).toISOString(),
        isReddit: true,
        flair: p.link_flair_text || null,
      }));

    return res.status(200).json({
      success: true,
      posts,
      subreddit,
      sort,
    });
  } catch (error) {
    console.error("Reddit Proxy Error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}