function NewsCard({ news }) {
  if (!news.url) return null;

  return (
    <div className="card">
      <img
        src={news.urlToImage || "https://via.placeholder.com/400x200"}
        alt="news"
      />
      <h3>{news.title}</h3>
      <p>{news.description || "No description available."}</p>

      <a
        href={news.url}
        target="_blank"
        rel="noreferrer"
      >
        Read More →
      </a>
    </div>
  );
}

export default NewsCard;
