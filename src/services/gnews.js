const GNEWS_ENDPOINT = "/api/gnews";

export async function fetchGNews(category = "general", country = "in", page = 1, searchTerm = "") {
  const params = new URLSearchParams({
    category,
    country,
    page: String(page),
  });

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  const response = await fetch(`${GNEWS_ENDPOINT}?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "GNews fetch failed.");
  }

  return data.articles || [];
}
