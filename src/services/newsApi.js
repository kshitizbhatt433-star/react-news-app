// News API Service with Vercel Proxy
// Supports: GNews, Reddit, RSS feeds

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const VERCEL_URL = "https://headlinenewsx-app.vercel.app";
const IS_PRODUCTION = import.meta.env.MODE === "production";

// ─────────────────────────────────────────
// GNews — existing, unchanged
// ─────────────────────────────────────────
export const fetchNews = async (country = "in", category = "general", page = 1, searchTerm = "") => {
  try {
    let query = searchTerm;
    if (!query) {
      switch (category) {
        case "general":
          query = country === "in" ? "india news" : "world news";
          break;
        case "india":
          query = "india news";
          break;
        case "world":
          query = "world news";
          break;
        case "bollywood":
          query = country === "in" ? "bollywood india" : "bollywood";
          break;
        default:
          query = `${category}${country === "in" ? " india" : ""}`.trim();
      }
    }

    let articles = [];
    let useDirectApi = false;

    if (IS_PRODUCTION) {
      try {
        articles = await fetchFromVercel(query, page, category, country);
      } catch (vercelError) {
        console.warn("Vercel failed, trying direct API...", vercelError);
        useDirectApi = true;
      }
    } else {
      useDirectApi = true;
    }

    if (useDirectApi) {
      articles = await fetchDirectFromGNews(query, page);
    }

    return articles;
  } catch (error) {
    console.error("News API Error:", error);
    throw error;
  }
};

const fetchFromVercel = async (query, page, category, country) => {
  const endpoint = `${VERCEL_URL}/api/news?q=${encodeURIComponent(query)}&page=${page}&category=${category}&country=${country}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    mode: "cors",
  });
  if (!response.ok) throw new Error(`Vercel HTTP Error: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.articles || [];
};

const fetchDirectFromGNews = async (query, page) => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    console.warn("GNews API key not configured. Using mock data for development.");
    // Return mock data for development
    return [
      {
        title: "Sample News Article - API Key Required",
        description: "This is a placeholder article. To see real news, please set VITE_NEWS_API_KEY in .env.local with your GNews API key from https://gnews.io/register",
        image: "https://placehold.co/400x200/eaf6f8/64748b?text=API+Key+Needed",
        url: "https://gnews.io/register",
        source: { name: "GNews API Setup Required" },
        publishedAt: new Date().toISOString(),
        urlToImage: "https://placehold.co/400x200/eaf6f8/64748b?text=API+Key+Needed",
      }
    ];
  }
  const params = new URLSearchParams({ q: query, lang: "en", max: 20, page, token: API_KEY });
  const response = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`, { mode: "cors" });
  if (!response.ok) throw new Error(`GNews API error: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return (data.articles || []).map((a) => ({
    title: a.title,
    description: a.description,
    image: a.image,
    url: a.url,
    source: { name: a.source?.name || "Unknown" },
    publishedAt: a.publishedAt,
    urlToImage: a.image,
  }));
};

// ─────────────────────────────────────────
// Reddit API
// ─────────────────────────────────────────
export const fetchRedditPosts = async (subreddit = "india", sort = "hot", limit = 20) => {
  try {
    if (IS_PRODUCTION) {
      const res = await fetch(
        `${VERCEL_URL}/api/reddit?subreddit=${subreddit}&sort=${sort}&limit=${limit}`,
        { mode: "cors" }
      );
      if (!res.ok) throw new Error(`Reddit proxy error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.posts || [];
    } else {
      return await fetchRedditDirect(subreddit, sort, limit);
    }
  } catch (err) {
    console.error("Reddit fetch error:", err);
    throw err;
  }
};

const fetchRedditDirect = async (subreddit, sort, limit) => {
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`,
    { mode: "cors" }
  );
  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);
  const data = await res.json();
  return transformRedditPosts(data.data?.children || []);
};

export const transformRedditPosts = (children) =>
  children
    .map((c) => c.data)
    .filter((p) => !p.stickied)
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.selftext?.substring(0, 200) || null,
      url: p.url,
      permalink: `https://reddit.com${p.permalink}`,
      image: p.thumbnail?.startsWith("http") ? p.thumbnail : null,
      source: { name: `r/${p.subreddit}` },
      author: p.author,
      score: p.score,
      numComments: p.num_comments,
      publishedAt: new Date(p.created_utc * 1000).toISOString(),
      isReddit: true,
      flair: p.link_flair_text || null,
    }));

// ─────────────────────────────────────────
// RSS Feeds
// ─────────────────────────────────────────
export const RSS_SOURCES = [
  { name: "NDTV",        url: "https://feeds.feedburner.com/ndtvnews-top-stories",    category: "general" },
  { name: "The Hindu",   url: "https://www.thehindu.com/rss",                         category: "general" },
  { name: "India Today", url: "https://www.indiatoday.in/rss/1206578",               category: "general" },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "general" },
  { name: "BBC India",   url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml", category: "general" },
  { name: "Scroll.in",   url: "https://scroll.in/rss.xml",                            category: "general" },
  { name: "ThePrint",    url: "https://theprint.in/feed/",                            category: "general" },
  { name: "Firstpost",   url: "https://www.firstpost.com/feed",                       category: "general" },
  { name: "Hindustan Times", url: "https://www.hindustantimes.com/rss/topnews/rssfeed.xml", category: "general" },
  { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeeds/1715249553.cms", category: "business" },
  { name: "TechCrunch",  url: "https://techcrunch.com/feed/",                         category: "technology" },
  { name: "Cricbuzz",    url: "https://www.cricbuzz.com/cricket-news/rss-feeds",      category: "sports" },
  { name: "Mint",        url: "https://www.livemint.com/rss/homepage",                category: "business" },
  { name: "Business Standard", url: "https://www.business-standard.com/rss/home_page_rss.xml", category: "business" },
];

export const fetchRSSFeed = async (sourceIndex = 0) => {
  const source = RSS_SOURCES[sourceIndex];
  if (!source) throw new Error("Invalid RSS source index");

  try {
    if (IS_PRODUCTION) {
      const res = await fetch(
        `${VERCEL_URL}/api/rss?url=${encodeURIComponent(source.url)}&name=${encodeURIComponent(source.name)}`,
        { mode: "cors" }
      );
      if (!res.ok) throw new Error(`RSS proxy error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.articles || [];
    } else {
      // In dev, use rss2json public API
      return await fetchRSSDirect(source.url, source.name);
    }
  } catch (err) {
    console.error(`RSS fetch error (${source.name}):`, err);
    throw err;
  }
};

export const fetchRSSDirect = async (feedUrl, sourceName) => {
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=20`,
    { mode: "cors" }
  );
  if (!res.ok) throw new Error(`RSS2JSON error: ${res.status}`);
  const data = await res.json();
  if (data.status !== "ok") throw new Error("RSS feed failed");
  return transformRSSItems(data.items || [], sourceName);
};

export const transformRSSItems = (items, sourceName) =>
  items.map((item) => ({
    title: item.title,
    description: item.description?.replace(/<[^>]+>/g, "").substring(0, 200) || null,
    image: item.thumbnail || item.enclosure?.link || null,
    url: item.link,
    source: { name: sourceName },
    publishedAt: item.pubDate,
    urlToImage: item.thumbnail || null,
    isRSS: true,
  }));

// Fetch all RSS sources for a category
export const fetchAllRSSByCategory = async (category = "general") => {
  const sources = RSS_SOURCES
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => s.category === category);

  const results = await Promise.allSettled(
    sources.map((s) => fetchRSSFeed(s.index))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);
};

// ─────────────────────────────────────────
// YouTube API
// ─────────────────────────────────────────
export const fetchYouTubeVideos = async (channel = "all", type = "videos") => {
  try {
    if (IS_PRODUCTION) {
      const res = await fetch(
        `${VERCEL_URL}/api/youtube?channel=${channel}&type=${type}`,
        { mode: "cors" }
      );
      if (!res.ok) throw new Error(`YouTube proxy error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.items || [];
    } else {
      // In dev, direct API call (requires API key in env)
      const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your_youtube_api_key_here") {
        console.warn("YouTube API key not configured. Using mock data for development.");
        // Return mock YouTube data for development
        return [
          {
            id: "mock_video_1",
            title: "Sample YouTube Video - API Key Required",
            description: "This is a placeholder video. To see real YouTube content, please set VITE_YOUTUBE_API_KEY in .env.local with your YouTube API key from Google Developers Console.",
            thumbnail: "https://placehold.co/400x200/eaf6f8/64748b?text=YouTube+API+Needed",
            url: "https://console.developers.google.com/",
            publishedAt: new Date().toISOString(),
            channelTitle: "YouTube API Setup Required",
            channel: "setup",
            liveBroadcastContent: "none"
          }
        ];
      }
      return await fetchYouTubeDirect(channel, type, YOUTUBE_API_KEY);
    }
  } catch (err) {
    console.error("YouTube fetch error:", err);
    throw err;
  }
};

const fetchYouTubeDirect = async (channel, type, apiKey) => {
  const channels = {
    // Indian News Channels
    'aajtak': 'UCt4t-jeY85JegMlZ-E5UWtA',
    'zeenews': 'UCIvaYmXn910QMdemBG3v1pQ',
    'indiatoday': 'UCYPvAwZP8pZhSMW8qs7cVCw',
    'ndtv': 'UC9CYT9gSNLjWKeJYA1gWuVg',
    'abpnews': 'UC6RJ7-PaXg6TIH2BzZfTV7w',
    'news18': 'UCc6rH3LrhyOFTi8-8kx8Fvw',
    'republicbharat': 'UC7wXt18f9MKgB0p2Ta4N8IA',
    'indiatv': 'UCttspZesZIDEwwpVIgoZtWQ',
    'timesnow': 'UC6RJ7-PaXg6TIH2BzZfTV7w',
    'cnnnews18': 'UCef1-8eOpJgud7szV_FUpZQ',
    'ddnews': 'UCZFMm1mMw0F81Z37aaEzWdw',
    'tv9bharatvarsh': 'UC2J_VKrAzOEJuQvFFtj3KU',
    'altnews': 'UCdDjo-EEBBwVgMVoxZmyRg',
    'thewire': 'UCJ9l7LwKJZKvU8QO2wHf2Zw',
    'scrollnews': 'UCJ9l7LwKJZKvU8QO2wHf2Zw',
    'theprint': 'UCuyRsHZILrU7ZDIAbGASHdA',
    'newslaundry': 'UCJ9l7LwKJZKvU8QO2wHf2Zw',

    // Global News Channels
    'bbc': 'UC16niRr50-MSBwiO3YDb3RA',
    'cnn': 'UCupvZG-5ko_eiXAupbDfxWw',
    'reuters': 'UChqURNqkkhZKQTvjE7DNUVQ',
    'aljazeera': 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    'bloomberg': 'UCIALMKvObZNtJ6AmdCLP7Lg',
    'foxnews': 'UCXIJgqnII2ZOINSWNOGFThA',
    'nbcnews': 'UCeY0bbntWzzVIaj2z3QigXg',
    'abcnews': 'UCBi2mrWuNuyYy4gbM6fU18Q',
    'cbsnews': 'UC8p1vwvWFGgHdWpDJKJ2xVg',
    'skynews': 'UCoMdktPbSTixAyNGwb-UYkQ',
    'guardian': 'UCIRYBXDze5krPDzAEOxFGVA',
    'nytimes': 'UCqnbDFdCpuN8CMEg0VuEBqA',
    'washingtonpost': 'UCeiYXex_fS1KwZL0wqzlVzQ',
    'apnews': 'UC52X5wxOL_s9ywVGdE5qRQ',
    'france24': 'UCUdOoVWuWmgo1wByzcsyKDQ',
    'dwnews': 'UCknLrEdhRCp1aegoMqRaCZg',
    'rtnews': 'UCpwvZwUam-URkxB7g4USKpg',
    'cgtn': 'UCgrNz-aDmcr2uuto8_DL2Tg'
  };

  const baseUrl = 'https://www.googleapis.com/youtube/v3';
  let allVideos = [];

  if (channel === 'all') {
    for (const [name, channelId] of Object.entries(channels)) {
      try {
        const videos = await fetchChannelVideosDirect(channelId, apiKey, type, baseUrl);
        allVideos.push(...videos.map(v => ({ ...v, channel: name })));
      } catch (error) {
        console.error(`Error fetching ${name}:`, error);
      }
    }
  } else {
    const channelId = channels[channel];
    if (!channelId) throw new Error("Invalid channel");
    allVideos = await fetchChannelVideosDirect(channelId, apiKey, type, baseUrl);
    allVideos = allVideos.map(v => ({ ...v, channel }));
  }

  allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return allVideos.slice(0, 20);
};

const fetchChannelVideosDirect = async (channelId, apiKey, type, baseUrl) => {
  if (type === 'live') {
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
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      isYouTube: true,
      type: 'live'
    }));
  } else {
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
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      isYouTube: true,
      type: 'video'
    }));
  }
};