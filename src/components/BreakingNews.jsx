const BreakingNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const breakingArticle = articles[0];

  return (
    <div className="breaking-news">
      <div className="breaking-badge">🔴 BREAKING</div>
      <div className="breaking-content">
        <h3>{breakingArticle.title?.substring(0, 80)}...</h3>
        <a href={breakingArticle.url} target="_blank" rel="noreferrer" className="breaking-link">
          Read more →
        </a>
      </div>
      <div className="breaking-animate"></div>
    </div>
  );
};

export default BreakingNews;
