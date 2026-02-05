import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const Home = ({
  category = "general",
  country = "in",
  refreshKey = 0,
  searchTerm = ""
}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [page, setPage] = useState(1);

  // ✅ Fetch news via Netlify function
  const fetchNewsPage = async (pageNum = 1, append = false) => {
    pageNum === 1 ? setLoading(true) : setLoadingMore(true);

    const params = new URLSearchParams({
      country,
      category,
      page: pageNum,
      q: searchTerm
    });

    try {
      // 🔹 Use full Netlify function path
      const url = `/.netlify/functions/news?${params.toString()}`;
      console.log("Fetching from:", url);
      
      const res = await fetch(url);
      console.log("Response status:", res.status, "Content-Type:", res.headers.get("content-type"));
      
      const text = await res.text();
      console.log("Raw response (first 200 chars):", text.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("JSON parse failed. Response starts with:", text.substring(0, 100));
        throw new Error("Invalid JSON response: " + parseErr.message);
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch news");
      }

      const newArticles = data.articles || [];
      setApiError(null);
      setArticles((prev) => (append ? [...prev, ...newArticles] : newArticles));
    } catch (err) {
      console.error("News fetch failed:", err);
      setApiError(err.message || "Network error");
      if (pageNum === 1) setArticles([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 🔹 Fetch first page or when category/country/refreshKey changes
  useEffect(() => {
    setPage(1);
    fetchNewsPage(1, false);
  }, [category, country, refreshKey, searchTerm]);

  // 🔹 Scroll button show/hide
  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <Loader />;

  if (apiError) {
    return (
      <div className="center-msg">
        <h2>Unable to load news</h2>
        <p style={{ color: "var(--muted)" }}>{apiError}</p>
      </div>
    );
  }

  // 🔹 Client-side search filter
  const filtered = articles.filter((a) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      a.title?.toLowerCase().includes(s) ||
      a.description?.toLowerCase().includes(s)
    );
  });

  if (filtered.length === 0) {
    return <h2 className="center-msg">No news available</h2>;
  }

  // 🔹 Render
  return (
    <main>
      <section className="news-container">
        {filtered.map((news, index) => {
          const published = news.publishedAt ? new Date(news.publishedAt) : null;
          const isNew = published ? (Date.now() - published.getTime()) < 1000 * 60 * 60 * 12 : false;

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
                  <span className="source">{news.source?.name || "Unknown"}</span>
                  <span className="date">{published ? published.toLocaleString() : ""}</span>
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
