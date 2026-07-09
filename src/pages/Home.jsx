import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader";
import ShareButtons from "../components/ShareButtons";
import LiveNewsTicker from "../components/LiveNewsTicker";
import { fetchNews } from "../services/newsService";

const CATEGORIES = [
  { emoji: "�", label: "Top Stories", desc: "The day’s most important headlines", cat: "general", country: "in" },
  { emoji: "🇮🇳", label: "India", desc: "Local news from across India", cat: "india", country: "in" },
  { emoji: "🌍", label: "World", desc: "Global headlines and breaking coverage", cat: "world", country: null },
  { emoji: "🛡️", label: "Defense & War", desc: "Military, defense and geopolitical developments", cat: "defense", country: null },
  { emoji: "🏛️", label: "Politics", desc: "Government, policy and elections", cat: "politics", country: null },
  { emoji: "💼", label: "Business", desc: "Markets, economy and corporate news", cat: "business", country: null },
  { emoji: "💡", label: "Technology", desc: "Innovation, gadgets and startups", cat: "technology", country: null },
  { emoji: "🏏", label: "Sports", desc: "Match updates, scores and commentary", cat: "sports", country: null },
  { emoji: "🎬", label: "Entertainment", desc: "Movies, TV and culture stories", cat: "entertainment", country: null },
  { emoji: "🎥", label: "Bollywood", desc: "Cinema news and celebrity updates", cat: "bollywood", country: null },
  { emoji: "🔬", label: "Science", desc: "Research, discoveries and innovation", cat: "science", country: null },
  { emoji: "💊", label: "Health", desc: "Wellness, medicine and health trends", cat: "health", country: null },
];

function getTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getReadingTime(text) {
  if (!text) return 1;
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function isNewArticle(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) < 1000 * 60 * 60 * 12;
}

function getCategoryLabel(category) {
  switch (category) {
    case "general": return "Top Stories";
    case "india": return "India News";
    case "world": return "World News";
    case "defense": return "Defense & War";
    case "politics": return "Politics";
    case "business": return "Business";
    case "technology": return "Technology";
    case "sports": return "Sports";
    case "entertainment": return "Entertainment";
    case "bollywood": return "Bollywood";
    case "science": return "Science";
    case "health": return "Health";
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

const Home = ({
  category = "general",
  country = "in",
  refreshKey = 0,
  searchTerm = "",
  onCategoryChange,
  onCountryChange,
}) => {
  const [articles, setArticles]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError]       = useState(null);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);

  const [bookmarks, setBookmarks] = useState(() =>
    JSON.parse(localStorage.getItem("bookmarks") || "[]")
  );
  const [savedArticles, setSavedArticles] = useState(() =>
    JSON.parse(localStorage.getItem("savedArticles") || "[]")
  );
  const [selectedState, setSelectedState] = useState(null);

  const [loadMoreError, setLoadMoreError] = useState(null);

  const fetchNewsPage = useCallback(async (pageNum = 1, append = false) => {
    pageNum === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      let searchQuery = searchTerm;
      if (selectedState) {
        searchQuery = searchQuery ? `${searchQuery} ${selectedState}` : selectedState;
      }

      const newArticles = await fetchNews(category, country, pageNum, searchQuery);

      setApiError(null);
      setLoadMoreError(null);
      setArticles((prev) => append ? [...prev, ...newArticles] : newArticles);
      setHasMore(newArticles.length > 0);
    } catch (err) {
      const message = err.message || "Network error. Please check your API key.";
      if (append) {
        // Don't wipe the page for a Load More failure — show inline error,
        // keep existing articles, and stop offering further pages.
        setLoadMoreError(message);
        setHasMore(false);
      } else {
        setApiError(message);
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [country, category, searchTerm, selectedState]);

  useEffect(() => {
    setPage(1);
    fetchNewsPage(1, false);
  }, [fetchNewsPage, refreshKey]);

  const toggleBookmark = (url) => {
    setBookmarks((prev) => {
      const updated = prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSave = (url) => {
    setSavedArticles((prev) => {
      const updated = prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      localStorage.setItem("savedArticles", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNewsPage(next, true);
  };

  const handleCategoryClick = (cat, ctry) => {
    if (onCategoryChange) onCategoryChange(cat);
    if (ctry && onCountryChange) onCountryChange(ctry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <Loader />;

  if (apiError) {
    return (
      <div className="center-msg">
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 8 }}>Unable to load news</h2>
        <p style={{ color: "var(--muted)", maxWidth: 400, margin: "0 auto" }}>{apiError}</p>
        <button className="retry-btn" onClick={() => fetchNewsPage(1, false)}>
          Retry fetching headlines
        </button>
      </div>
    );
  }

  const filtered = articles.filter((a) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return a.title?.toLowerCase().includes(s) || a.description?.toLowerCase().includes(s);
  });

  if (filtered.length === 0) {
    return (
      <div className="center-msg">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>No results found</h2>
        <p style={{ color: "var(--muted)" }}>Try a different search term or category</p>
      </div>
    );
  }

  const fallback = "https://placehold.co/800x450/f0eeff/6c47ff?text=HeadlineX";

  const heroArticle = filtered[0];
  const trendingArticles = filtered.slice(1, 5);

  return (
    <main>
      <LiveNewsTicker articles={trendingArticles.slice(0, 4)} />

      <section className="breaking-news">
        <div className="breaking-badge"><span className="breaking-dot"></span>Breaking News</div>
        <div className="breaking-content">
          <h3>{heroArticle?.title || "Stay informed with the latest headlines"}</h3>
          <p className="description">{heroArticle?.description || "Explore the most important stories from India and around the world, curated for a fast-moving news cycle."}</p>
          {heroArticle?.url && (
            <a className="breaking-link" href={heroArticle.url} target="_blank" rel="noreferrer">
              Read the full story →
            </a>
          )}
        </div>
      </section>

      {trendingArticles.length > 0 && (
        <section className="trending-section">
          <div className="trending-title">⚡ Trending Now</div>
          <div className="trending-items">
            {trendingArticles.map((news, index) => (
              <a
                key={news.url || index}
                href={news.url}
                target="_blank"
                rel="noreferrer"
                className="trending-item"
              >
                <span className="trending-num">{index + 1}</span>
                <div className="trending-info">
                  <h4>{news.title}</h4>
                  <span className="trending-source">{news.source?.name || "HeadlineX"}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="news-toolbar">
        <div className="toolbar-left">
          <h2>{getCategoryLabel(category)}</h2>
          <p className="toolbar-sub">{filtered.length} headlines available</p>
        </div>
      </div>

      <section className="news-container">
        {filtered.map((news, index) => {
          const newsUrl    = news.url;
          const bookmarked = bookmarks.includes(newsUrl);
          const saved      = savedArticles.includes(newsUrl);
          const timeAgo    = getTimeAgo(news.publishedAt);
          const readTime   = getReadingTime(news.description || news.title);
          const fresh      = isNewArticle(news.publishedAt);

          return (
            <article key={newsUrl || index} className="news-card">
              <div className="media">
                <img
                  src={news.image || news.urlToImage || fallback}
                  alt={news.title || "news"}
                  onError={(e) => { e.target.src = fallback; }}
                  loading="lazy"
                />
                {fresh && <span className="badge">🔥 New</span>}
              </div>

              <div className="content">
                <div className="meta">
                  <span className="source">{news.source?.name || "Unknown"}</span>
                  <span className="category-tag">{getCategoryLabel(news.category || category)}</span>
                  {timeAgo && <span className="date">{timeAgo}</span>}
                  <span className="reading-time">⏱ {readTime} min read</span>
                </div>

                <h3 className="title">{news.title}</h3>
                {news.description && (
                  <p className="description">{news.description}</p>
                )}

                <div className="article-actions">
                  <a
                    className="read-more-btn"
                    href={newsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read Article →
                  </a>

                  <button
                    className={`action-btn ${bookmarked ? "active" : ""}`}
                    onClick={() => toggleBookmark(newsUrl)}
                    title={bookmarked ? "Remove bookmark" : "Bookmark"}
                    aria-label="Bookmark"
                  >
                    🔖
                  </button>

                  <button
                    className={`action-btn ${saved ? "active" : ""}`}
                    onClick={() => toggleSave(newsUrl)}
                    title={saved ? "Unsave" : "Save for later"}
                    aria-label="Save"
                  >
                    💾
                  </button>

                  <ShareButtons title={news.title} url={newsUrl} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {loadMoreError && (
        <div className="load-more-wrap">
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>
            Couldn't load more articles: {loadMoreError}
          </p>
          <button
            className="load-more-btn"
            onClick={() => { setHasMore(true); fetchNewsPage(page, true); }}
          >
            Try Again
          </button>
        </div>
      )}

      {hasMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <span className="load-more-inner">
                <span className="load-spinner" /> Loading...
              </span>
            ) : (
              "Load More Articles"
            )}
          </button>
        </div>
      )}

      <section className="category-section">
        <div className="category-container">
          <h2 className="category-heading">
            <span className="heading-text">Browse News Sections</span>
          </h2>
          <div className="category-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.cat + c.label}
                className="category-item"
                onClick={() => handleCategoryClick(c.cat, c.country)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(c.cat, c.country)}
              >
                <div className="category-icon">{c.emoji}</div>
                <h3>{c.label}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;