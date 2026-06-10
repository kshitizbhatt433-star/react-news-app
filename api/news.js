import { setCorsHeaders, dedupeAndSortArticles } from "./news-utils.js";
import { fetchNewsDataArticles } from "./newsdata.js";
import { fetchGNewsArticles } from "./gnews.js";
import { fetchTheNewsApiArticles } from "./thenewsapi.js";

const CACHE_TTL = 1000 * 60 * 1;
const CACHE = new Map();

const createCacheKey = ({ category, country, q, page }) => `${category}|${country}|${q}|${page}`;

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category = "general", country = "in", q = "", page = "1" } = req.query;
    const cacheKey = createCacheKey({ category, country, q, page });
    const cached = CACHE.get(cacheKey);

    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.status(200).json(cached.value);
    }

    const sources = [];
    if (process.env.NEWSDATA_API_KEY) {
      sources.push({ name: "NewsData.io", fetcher: fetchNewsDataArticles });
    }
    if (process.env.NEWS_API_KEY) {
      sources.push({ name: "GNews", fetcher: fetchGNewsArticles });
    }
    if (process.env.THENEWSAPI_KEY) {
      sources.push({ name: "TheNewsAPI", fetcher: fetchTheNewsApiArticles });
    }

    if (!sources.length) {
      return res.status(500).json({
        error: "No news API keys are configured. Please add NEWS_API_KEY, NEWSDATA_API_KEY, or THENEWSAPI_KEY.",
      });
    }

    const settled = await Promise.allSettled(
      sources.map((source) =>
        source.fetcher({ category, country, searchTerm: q, page: Number(page) })
      )
    );

    const errors = [];
    const articles = [];

    settled.forEach((result, index) => {
      const sourceName = sources[index].name;
      if (result.status === "fulfilled") {
        articles.push(...result.value);
      } else {
        errors.push(`${sourceName} failed: ${result.reason?.message || "Unknown error"}`);
      }
    });

    if (!articles.length) {
      return res.status(500).json({
        error: "Unable to load news from the configured sources.",
        details: errors,
      });
    }

    const merged = dedupeAndSortArticles(articles);
    const payload = {
      success: true,
      articles: merged,
      sourceCount: merged.length,
      errors,
    };

    CACHE.set(cacheKey, { ts: Date.now(), value: payload });
    return res.status(200).json(payload);
  } catch (error) {
    console.error("News aggregator error:", error);
    return res.status(500).json({ error: "Internal server error while fetching news.", details: error.message });
  }
}
