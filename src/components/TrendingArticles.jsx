import { useState, useEffect } from "react";

const TrendingArticles = ({ articles }) => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      setTrending(articles.slice(0, 5));
    }
  }, [articles]);

  if (trending.length === 0) return null;

  return (
    <section className="trending-section">
      <h2 className="trending-title">🔥 Trending Now</h2>
      <div className="trending-items">
        {trending.map((article, idx) => (
          <a
            key={article.url || idx}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="trending-item"
            title={article.title}
          >
            {/* Number */}
            <span className="trending-num">#{idx + 1}</span>

            {/* Info — flex child with min-width:0 so it shrinks */}
            <div className="trending-info">
              <h4>
                {article.title?.length > 60
                  ? article.title.substring(0, 60) + "…"
                  : article.title}
              </h4>
              <span className="trending-source">
                {article.source?.name || "Unknown"}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default TrendingArticles;