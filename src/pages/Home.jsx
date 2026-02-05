import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const Home = ({ category, country, useNewest = false, refreshKey = 0, searchTerm = "" }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [page, setPage] = useState(1);

  const fetchNewsPage = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    let url = "";

    const BASE = (import.meta.env.VITE_NEWS_API_BASE || "https://newsapi.org/v2").replace(/\/$/, "");
    const KEY = import.meta.env.VITE_NEWS_API_KEY || "";
    const KEY_PARAM = import.meta.env.VITE_NEWS_API_KEY_PARAM || "apiKey";

    if (country === "in") {
      const query = category === "general" ? "india" : `india ${category}`;
      url = `${BASE}/search?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=40&page=${pageNum}&${KEY_PARAM}=${KEY}`;
    } else {
      if (useNewest) {
        const q = category === "general" ? "news" : category;
        url = `${BASE}/search?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=40&language=en&page=${pageNum}&${KEY_PARAM}=${KEY}`;
      } else {
        url = `${BASE}/top-headlines?country=us&category=${category}&pageSize=40&page=${pageNum}&${KEY_PARAM}=${KEY}`;
      }
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.status && data.status !== "ok") {
        setApiError(`${data.code || "error"}: ${data.message || "Failed to fetch news"}`);
        if (pageNum === 1) setArticles([]);
      } else {
        setApiError(null);
        const newArticles = data.articles || [];
        if (append) {
          setArticles((prev) => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
        }
      }
    } catch (err) {
      console.error("News fetch failed:", err);
      setApiError(err.message || "Network error");
      if (pageNum === 1) setArticles([]);
    }

    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);
  };

  useEffect(() => {
    setPage(1);
    fetchNewsPage(1, false);
  }, [category, country, useNewest, refreshKey]);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (apiError) {
    return (
      <div className="center-msg">
        <h2>Unable to load news</h2>
        <p style={{ color: "var(--muted)" }}>{apiError}</p>
        <p style={{ color: "var(--muted)" }}>Likely causes: invalid API key, rate limit, or missing env variable. Restart the dev server after updating <code>.env</code>.</p>
      </div>
    );
  }

  // apply client-side search filtering
  const filtered = (articles || []).filter((a) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(s)) ||
      (a.description && a.description.toLowerCase().includes(s)) ||
      (a.source?.name && a.source.name.toLowerCase().includes(s))
    );
  });

  if (!filtered || filtered.length === 0) {
    return <h2 className="center-msg">No news available for this selection</h2>;
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "";
    }
  };
  return (
    <main>
      <section className="news-container">
        {filtered.map((news, index) => {
          const published = news.publishedAt ? new Date(news.publishedAt) : null;
          const isNew = published ? (Date.now() - published.getTime()) < 1000 * 60 * 60 * 12 : false; // 12 hours

          return (
            <article key={index} className="news-card">
              <div className="media">
                <img
                  src={news.image || news.urlToImage || "https://via.placeholder.com/800x450?text=No+Image"}
                  alt={news.title || "news image"}
                />

                {isNew && <span className="badge">New</span>}
              </div>

              <div className="content">
                <h3 className="title">{news.title}</h3>
                <p className="description">{news.description}</p>

                <div className="meta">
                  <span className="source">{typeof news.source === "string" ? news.source : news.source?.name}</span>
                  <span className="date">{formatDate(news.publishedAt)}</span>
                </div>

                <a className="read-more-btn" href={news.url} target="_blank" rel="noreferrer">
                  Read full article
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {articles.length > 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", marginBottom: "40px" }}>
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchNewsPage(nextPage, true);
            }}
            disabled={loadingMore}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loadingMore ? "not-allowed" : "pointer",
              opacity: loadingMore ? 0.6 : 1,
              transition: "opacity .2s"
            }}
          >
            {loadingMore ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}

      {showScroll && (
        <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">
          ↑
        </button>
      )}
    </main>
  );
};

export default Home;
