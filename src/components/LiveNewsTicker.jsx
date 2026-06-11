import React from 'react';

const LiveNewsTicker = ({ articles = [] }) => {
  const latest = Array.isArray(articles) ? articles.slice(0, 4) : [];

  return (
    <div className="live-ticker-container">
      <div className="live-ticker-header">
        <div className="live-indicator"></div>
        <h3>🔴 LIVE NEWS</h3>
      </div>
      <div className="live-ticker-content">
        {latest.length > 0 ? (
          <div className="live-streams-grid">
            {latest.map((article, index) => (
              <a
                key={article.url || index}
                className="live-stream-card"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="stream-thumbnail">
                  <img
                    src={article.image || "https://placehold.co/400x200/efe4ff/6c47ff?text=HeadlineX"}
                    alt={article.title || "Live headline"}
                  />
                </div>
                <div className="stream-info">
                  <h4>{article.title}</h4>
                  <p className="stream-channel">{article.source?.name || "HeadlineX"}</p>
                  <span className="watch-live-btn">Open Story</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <span>No live streams currently available. Browse the latest headlines below.</span>
        )}
      </div>
    </div>
  );
};

export default LiveNewsTicker;