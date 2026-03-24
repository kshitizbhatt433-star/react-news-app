// Vercel Serverless Function - YouTube API Proxy
// Fetches live videos and recent uploads from news channels

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "YouTube API key not configured on server.",
      });
    }

    // News channels: Aaj Tak, BBC India, Zee News, etc.
    const channels = {
      'aajtak': 'UCt4t-jeY85JegMlZ-E5UWtA',
      'bbc': 'UC16niRr50-MSBwiO3YDb3RA',
      'zeenews': 'UCIvaYmXn910QMdemBG3v1pQ',
      'indiatoday': 'UCYPvAwZP8pZhSMW8qs7cVCw',
      'ndtv': 'UC9CYT9gSNLjWKeJYA1gwuVg'
    };

    const { channel = 'all', type = 'videos' } = req.query;

    let allVideos = [];

    if (channel === 'all') {
      // Fetch from all channels
      for (const [name, channelId] of Object.entries(channels)) {
        try {
          const videos = await fetchChannelVideos(channelId, API_KEY, type);
          allVideos.push(...videos.map(v => ({ ...v, channel: name })));
        } catch (error) {
          console.error(`Error fetching ${name}:`, error);
        }
      }
    } else {
      const channelId = channels[channel];
      if (!channelId) {
        return res.status(400).json({ error: "Invalid channel" });
      }
      allVideos = await fetchChannelVideos(channelId, API_KEY, type);
      allVideos = allVideos.map(v => ({ ...v, channel }));
    }

    // Sort by published date, limit to 20
    allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    allVideos = allVideos.slice(0, 20);

    res.status(200).json({ items: allVideos });
  } catch (error) {
    console.error("YouTube API error:", error);
    res.status(500).json({ error: "Failed to fetch YouTube data" });
  }
}

async function fetchChannelVideos(channelId, apiKey, type) {
  const baseUrl = 'https://www.googleapis.com/youtube/v3';

  if (type === 'live') {
    // Search for live videos
    const searchUrl = `${baseUrl}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&order=date&maxResults=10&key=${apiKey}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      liveBroadcastContent: item.snippet.liveBroadcastContent,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } else {
    // Get recent uploads
    const playlistResponse = await fetch(`${baseUrl}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`);
    const playlistData = await playlistResponse.json();
    const uploadsPlaylistId = playlistData.items[0].contentDetails.relatedPlaylists.uploads;

    const videosResponse = await fetch(`${baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${apiKey}`);
    const videosData = await videosResponse.json();

    return videosData.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));
  }
}