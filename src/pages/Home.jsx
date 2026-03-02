import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader";
import BreakingNews from "../components/BreakingNews";
import TrendingArticles from "../components/TrendingArticles";
import ShareButtons from "../components/ShareButtons";
import { fetchNews } from "../services/newsApi";
import Comments from "../components/Comments";

const CATEGORIES = [
  { emoji: "🌍", label: "Global News",   desc: "Worldwide headlines",  cat: "general",       country: "us" },
  { emoji: "🇮🇳", label: "India News",    desc: "Latest from India",    cat: "general",       country: "in" },
  { emoji: "💼", label: "Business",      desc: "Markets & Finance",    cat: "business",      country: null },
  { emoji: "🧠", label: "Technology",    desc: "Tech innovations",     cat: "technology",    country: null },
  { emoji: "🏅", label: "Sports",        desc: "Match & game updates", cat: "sports",        country: null },
  { emoji: "🎬", label: "Entertainment", desc: "Movies & culture",     cat: "entertainment", country: null },
  { emoji: "🩺", label: "Health",        desc: "Wellness & medicine",  cat: "health",        country: null },
  { emoji: "🔬", label: "Science",       desc: "Discoveries & space",  cat: "science",       country: null },
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

const Home = ({
  category = "general",
  country = "in",
  refreshKey = 0,
  searchTerm = "",
  currentUser = null,
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

  const fetchNewsPage = useCallback(async (pageNum = 1, append = false) => {
    pageNum === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const newArticles = await fetchNews(country, category, pageNum, searchTerm);
      setApiError(null);
      setArticles((prev) => append ? [...prev, ...newArticles] : newArticles);
      setHasMore(newArticles.length > 0);
    } catch (err) {
      setApiError(err.message || "Network error. Please check your API key.");
      if (pageNum === 1) setArticles([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [country, category, searchTerm]);

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

  return (
    <main>
      {/* Breaking + Trending */}
      {filtered.length > 0 && <BreakingNews articles={filtered.slice(0, 3)} />}
      {filtered.length > 0 && <TrendingArticles articles={filtered.slice(0, 5)} />}

      {/* Section header */}
      <div className="news-toolbar">
        <div className="toolbar-left">
          <h2>
            {category.charAt(0).toUpperCase() + category.slice(1)} News
          </h2>
          <p className="toolbar-sub">{filtered.length} articles found</p>
        </div>
      </div>

      {/* News Grid */}
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
              {/* Image */}
              <div className="media">
                <img
                  src={news.image || news.urlToImage || fallback}
                  alt={news.title || "news"}
                  onError={(e) => { e.target.src = fallback; }}
                  loading="lazy"
                />
                {fresh && <span className="badge">🔥 New</span>}
              </div>

              {/* Content */}
              <div className="content">
                {/* Meta */}
                <div className="meta">
                  <span className="source">{news.source?.name || "Unknown"}</span>
                  {timeAgo && <span className="date">{timeAgo}</span>}
                  <span className="reading-time">⏱ {readTime} min read</span>
                </div>

                {/* Title */}
                <h3 className="title">{news.title}</h3>

                {/* Description */}
                {news.description && (
                  <p className="description">{news.description}</p>
                )}

                {/* Actions */}
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

                {/* Comments */}
                <Comments articleUrl={newsUrl} currentUser={currentUser} />
              </div>
            </article>
          );
        })}
      </section>

      {/* Load More */}
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

      {/* Category Explorer */}
      <section className="category-section">
        <div className="category-container">
          <h2 className="category-heading">
            <span className="heading-text">✨ Explore Categories</span>
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