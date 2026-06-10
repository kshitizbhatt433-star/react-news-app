const NEWSDATA_ENDPOINT = "/api/newsdata";

export async function fetchNewsData(category = "general", country = "in", page = 1, searchTerm = "") {
  const params = new URLSearchParams({
    category,
    country,
    page: String(page),
  });

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  const response = await fetch(`${NEWSDATA_ENDPOINT}?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "NewsData.io fetch failed.");
  }

  return data.articles || [];
}
