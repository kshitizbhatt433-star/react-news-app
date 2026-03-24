import { useState } from "react";

function getTimeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getReadTime(text) {
  if (!text) return "1 min read";
  const words = text.split(" ").length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function getCredibility(sourceName) {
  const credible = ["BBC", "Reuters", "Associated Press", "The Hindu", "NDTV", "Times of India"];
  const moderate = ["India Today", "Hindustan Times", "Economic Times"];
  if (credible.some(s => sourceName.includes(s))) return { level: "high", icon: "✅", color: "#22c55e" };
  if (moderate.some(s => sourceName.includes(s))) return { level: "moderate", icon: "⚠️", color: "#f59e0b" };
  return { level: "unknown", icon: "❓", color: "#6b7280" };
}

function NewsCard({ news }) {
  const [saved, setSaved] = useState(false);

  if (!news.url) return null;

  const sourceName = news.source?.name || "News";
  const timeAgo = getTimeAgo(news.publishedAt);
  const readTime = getReadTime(news.description);
  const fallback = "https://placehold.co/400x200/eaf6f8/64748b?text=No+Image";
  const credibility = getCredibility(sourceName);

  return (
    <div className="news-card">
      {/* Image */}
      <div className="media">
        <img
          src={news.urlToImage || fallback}
          alt={news.title || "news"}
          onError={(e) => { e.target.src = fallback; }}
        />
        <span className="badge">{sourceName}</span>
      </div>

      {/* Body */}
      <div className="content">
        {/* Meta */}
        <div className="meta">
          <span className="source">{sourceName}</span>
          <span className="credibility" style={{ color: credibility.color }} title={`Credibility: ${credibility.level}`}>
            {credibility.icon}
          </span>
          <span className="date">{timeAgo}</span>
          <span className="reading-time">{readTime}</span>
        </div>

        {/* Title */}
        <h3 className="title">{news.title}</h3>

        {/* Description */}
        <p className="description">
          {news.description || "No description available."}
        </p>

        {/* Actions */}
        <div className="article-actions">
          <a
            href={news.url}
            target="_blank"
            rel="noreferrer"
            className="read-more-btn"
          >
            Read More →
          </a>

          <button
            className="action-btn"
            onClick={() => window.open(`https://www.google.com/search?q=fact+check+${encodeURIComponent(news.title)}`, "_blank")}
            title="Fact Check"
          >
            🔍
          </button>

          <div className="share-buttons">
            <button
              className="share-btn twitter"
              title="Share on Twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(news.url)}&text=${encodeURIComponent(news.title)}`, "_blank")}
            >
              𝕏
            </button>
            <button
              className="share-btn whatsapp"
              title="Share on WhatsApp"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(news.title + " " + news.url)}`, "_blank")}
            >
              💬
            </button>
            <button
              className="share-btn email"
              title="Share via Email"
              onClick={() => window.open(`mailto:?subject=${encodeURIComponent(news.title)}&body=${encodeURIComponent(news.url)}`, "_blank")}
            >
              ✉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;