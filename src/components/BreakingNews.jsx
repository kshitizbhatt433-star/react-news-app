import { useState, useEffect } from "react";

const BreakingNews = ({ articles }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!articles || articles.length <= 1) return;

    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % articles.length);
        setAnimating(false);
      }, 350);
    }, 5000);

    return () => clearInterval(interval);
  }, [articles]);

  if (!articles || articles.length === 0) return null;

  const article = articles[current];

  return (
    <div className="breaking-news" role="marquee" aria-live="polite">
      {/* Badge */}
      <div className="breaking-badge">
        <span className="breaking-dot" />
        BREAKING
      </div>

      {/* Content */}
      <div className={`breaking-content${animating ? " breaking-fade" : ""}`}>
        <h3>
          {article.title?.length > 100
            ? article.title.substring(0, 100) + "…"
            : article.title}
        </h3>
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="breaking-link"
        >
          Read more →
        </a>
      </div>

      {/* Dots indicator */}
      {articles.length > 1 && (
        <div className="breaking-dots">
          {articles.map((_, i) => (
            <button
              key={i}
              className={`breaking-dot-btn${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Breaking news ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Shimmer */}
      <div className="breaking-animate" aria-hidden="true" />
    </div>
  );
};

export default BreakingNews;