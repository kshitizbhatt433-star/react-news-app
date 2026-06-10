const THENEWSAPI_ENDPOINT = "/api/thenewsapi";

export async function fetchTheNewsApi(category = "general", country = "in", page = 1, searchTerm = "") {
  const params = new URLSearchParams({
    category,
    country,
    page: String(page),
  });

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  const response = await fetch(`${THENEWSAPI_ENDPOINT}?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "TheNewsAPI fetch failed.");
  }

  return data.articles || [];
}
