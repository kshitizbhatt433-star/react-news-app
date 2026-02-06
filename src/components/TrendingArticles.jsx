import { useState, useEffect } from "react";

const TrendingArticles = ({ articles }) => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      // Simulate trending by taking top 5 articles
      setTrending(articles.slice(0, 5));
    }
  }, [articles]);

  if (trending.length === 0) return null;

  return (
    <section className="trending-section">
      <div className="trending-container">
        <h2 className="trending-title">🔥 Trending Now</h2>
        <div className="trending-items">
          {trending.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="trending-item"
              title={article.title}
            >
              <span className="trending-num">#{idx + 1}</span>
              <div className="trending-info">
                <h4>{article.title?.substring(0, 45)}...</h4>
                <span className="trending-source">{article.source?.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingArticles;
