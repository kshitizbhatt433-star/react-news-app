import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader";
import ShareButtons from "../components/ShareButtons";
import LiveNewsTicker from "../components/LiveNewsTicker";
import { fetchNews, fetchYouTubeVideos, fetchRedditPosts, fetchAllRSSByCategory } from "../services/newsApi";

const CATEGORIES = [
  { emoji: "🕵️", label: "Intelligence", desc: "General OSINT reports", cat: "general", country: "in" },
  { emoji: "🔴", label: "Live News", desc: "Live streaming channels", cat: "youtube", country: null },
  { emoji: "🔒", label: "Security", desc: "Cybersecurity & threats", cat: "business", country: null },
  { emoji: "🔍", label: "Investigations", desc: "Deep dive analysis", cat: "entertainment", country: null },
  { emoji: "📊", label: "Analysis", desc: "Data & trend analysis", cat: "science", country: null },
  { emoji: "💻", label: "Cyber Intel", desc: "Digital intelligence", cat: "darkweb", country: null },
  { emoji: "📱", label: "Social Media", desc: "Social network OSINT", cat: "social", country: null },
  { emoji: "💀", label: "Data Leaks", desc: "Breach intelligence", cat: "leaks", country: null },
  { emoji: "🤖", label: "Reddit OSINT", desc: "Community intelligence", cat: "reddit", country: null },
  { emoji: "📡", label: "RSS Feeds", desc: "Direct source feeds", cat: "rss", country: null },
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

  const fetchNewsPage = useCallback(async (pageNum = 1, append = false) => {
    pageNum === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      let newArticles;
      let searchQuery = searchTerm;
      if (selectedState) {
        searchQuery = searchQuery ? `${searchQuery} ${selectedState}` : selectedState;
      }

      if (category === "youtube") {
        newArticles = await fetchYouTubeVideos("all", "live");
        // Transform YouTube videos to match article schema
        newArticles = newArticles.map(video => ({
          title: video.title,
          description: video.description?.substring(0, 200) || "",
          image: video.thumbnail,
          url: video.url,
          source: { name: `${video.channel} (YouTube Live)` },
          publishedAt: video.publishedAt,
          urlToImage: video.thumbnail,
          isYouTube: true,
          liveBroadcastContent: video.liveBroadcastContent
        }));
      } else if (category === "reddit") {
        // OSINT: Reddit intelligence
        newArticles = await fetchRedditPosts("india", "hot", 20);
      } else if (category === "rss") {
        // OSINT: RSS feed intelligence
        newArticles = await fetchAllRSSByCategory("general");
      } else {
        // Default: regular news categories
        newArticles = await fetchNews(country, category, pageNum, searchTerm);
      }

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
      {/* Live News Ticker */}
      <LiveNewsTicker />

      {/* Section header */}
      <div className="news-toolbar">
        <div className="toolbar-left">
          <h2>
            {category === "general" ? "Intelligence Feed" :
             category === "youtube" ? "Live News Streams" :
             category === "business" ? "Security Intelligence" :
             category === "entertainment" ? "Investigative Reports" :
             category === "science" ? "Technical Analysis" :
             category === "darkweb" ? "Dark Web Intelligence" :
             category === "social" ? "Social Media OSINT" :
             category === "leaks" ? "Data Breach Reports" :             category === "reddit" ? "Reddit OSINT Feed" :
             category === "rss" ? "RSS Intelligence Feeds" :             category.charAt(0).toUpperCase() + category.slice(1) + " Intelligence"}
          </h2>
          <p className="toolbar-sub">{filtered.length} intelligence reports found</p>
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