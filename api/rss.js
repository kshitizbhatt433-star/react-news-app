// api/rss.js
// Vercel Serverless Function — RSS Feed Proxy
// Fetches and parses RSS feeds from Indian & global news sources
// Uses rss2json as parser (free tier: 10,000 req/day)

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
};

// Whitelist of allowed RSS feed URLs for security
const ALLOWED_FEEDS = [
  "https://feeds.feedburner.com/ndtvnews-top-stories",
  "https://www.thehindu.com/featuredfeed/feed/?id=1",
  "https://www.indiatoday.in/rss/1206578",
  "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
  "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
  "https://techcrunch.com/feed/",
  "https://www.cricbuzz.com/cricket-news/rss-feeds",
];

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url, name = "News Source" } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    const decodedUrl = decodeURIComponent(url);

    // Security: only allow whitelisted feeds
    const isAllowed = ALLOWED_FEEDS.some((f) => decodedUrl.startsWith(f));
    if (!isAllowed) {
      return res.status(403).json({ error: "RSS feed URL not allowed" });
    }

    console.log(`Fetching RSS feed: ${name} — ${decodedUrl}`);

    // Use rss2json to parse the RSS feed
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(decodedUrl)}&count=20`;
    const response = await fetch(rss2jsonUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `RSS2JSON error: ${response.status}` });
    }

    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({ error: `RSS parse failed: ${data.message || "unknown"}` });
    }

    // Transform items to match our article format
    const articles = (data.items || []).map((item) => ({
      title: item.title?.trim(),
      description: item.description
        ? item.description.replace(/<[^>]+>/g, "").substring(0, 200)
        : null,
      image: item.thumbnail || item.enclosure?.link || null,
      url: item.link,
      source: { name },
      publishedAt: item.pubDate || null,
      urlToImage: item.thumbnail || null,
      isRSS: true,
    })).filter((a) => a.title && a.url);

    return res.status(200).json({
      success: true,
      articles,
      source: name,
      total: articles.length,
    });
  } catch (error) {
    console.error("RSS Proxy Error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}