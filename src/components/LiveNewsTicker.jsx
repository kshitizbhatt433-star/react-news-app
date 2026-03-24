import React, { useState, useEffect } from 'react';
import { fetchYouTubeVideos } from '../services/newsApi';

const LiveNewsTicker = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        setLoading(true);
        const streams = await fetchYouTubeVideos("all", "live");
        setLiveStreams(streams);
      } catch (err) {
        console.error("Error fetching live streams:", err);
        setError("Unable to load live streams");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStreams();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLiveStreams, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="live-ticker-container">
        <div className="live-ticker-header">
          <div className="live-indicator"></div>
          <h3>🔴 LIVE NEWS</h3>
        </div>
        <div className="live-ticker-content">
          <div className="loading-spinner"></div>
          <span>Loading live streams...</span>
        </div>
      </div>
    );
  }

  if (error || liveStreams.length === 0) {
    return (
      <div className="live-ticker-container">
        <div className="live-ticker-header">
          <div className="live-indicator"></div>
          <h3>🔴 LIVE NEWS</h3>
        </div>
        <div className="live-ticker-content">
          <span>{error || "No live streams currently available"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="live-ticker-container">
      <div className="live-ticker-header">
        <div className="live-indicator"></div>
        <h3>🔴 LIVE NEWS</h3>
      </div>
      <div className="live-ticker-content">
        <div className="live-streams-grid">
          {liveStreams.slice(0, 3).map((stream, index) => (
            <div key={stream.id} className="live-stream-card">
              <div className="stream-thumbnail">
                <img src={stream.thumbnail} alt={stream.title} />
                <div className="live-badge">LIVE</div>
              </div>
              <div className="stream-info">
                <h4>{stream.title}</h4>
                <p className="stream-channel">{stream.channelTitle}</p>
                <a
                  href={stream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-live-btn"
                >
                  Watch Live
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveNewsTicker;