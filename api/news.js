import { setCorsHeaders, dedupeAndSortArticles } from "./news-utils.js";
import { fetchGNewsArticles } from "./gnews.js";
import { fetchNewsDataArticles } from "./newsdata.js";
import { fetchTheNewsApiArticles } from "./thenewsapi.js";

const CACHE_TTL = 1000 * 60 * 2; // 2 minutes
const CACHE = new Map();

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "general", country = "in", q = "", page = "1" } = req.query;
    const cacheKey = `${category}|${country}|${q}|${page}`;
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.status(200).json(cached.value);
    }

    // Priority order: NewsData.io → GNews → TheNewsAPI
    // NewsData.io has no integer-based pagination on this plan — it only
    // supports a cursor token from a previous response — so it is only
    // ever called for page 1. GNews and TheNewsAPI support real page
    // numbers and carry pages 2+.
    const pageNum = Number(page) || 1;
    const sources = [];
    if (process.env.NEWSDATA_API_KEY && pageNum === 1) {
      sources.push({ name: "NewsData.io", fetcher: fetchNewsDataArticles });
    }
    if (process.env.GNEWS_API_KEY) {
      sources.push({ name: "GNews", fetcher: fetchGNewsArticles });
    }
    if (process.env.THENEWSAPI_KEY) {
      sources.push({ name: "TheNewsAPI", fetcher: fetchTheNewsApiArticles });
    }

    if (!sources.length) {
      return res.status(500).json({
        success: false,
        error: "No news API keys configured. Add NEWSDATA_API_KEY, GNEWS_API_KEY, or THENEWSAPI_KEY in Vercel environment variables.",
      });
    }

    const settled = await Promise.allSettled(
      sources.map((s) => s.fetcher({ category, country, searchTerm: q, page: pageNum }))
    );

    const articles = [];
    const errors = [];

    settled.forEach((result, i) => {
      if (result.status === "fulfilled") {
        articles.push(...result.value);
      } else {
        errors.push(`${sources[i].name}: ${result.reason?.message || "Unknown error"}`);
        console.error(`[${sources[i].name}] failed:`, result.reason?.message);
      }
    });

    if (!articles.length) {
      return res.status(502).json({
        success: false,
        error: "All news sources failed.",
        details: errors,
      });
    }

    const merged = dedupeAndSortArticles(articles);
    const payload = { success: true, articles: merged, count: merged.length, errors };

    CACHE.set(cacheKey, { ts: Date.now(), value: payload });
    return res.status(200).json(payload);
  } catch (err) {
    console.error("News aggregator error:", err);
    return res.status(500).json({ success: false, error: "Internal server error.", details: err.message });
  }
}