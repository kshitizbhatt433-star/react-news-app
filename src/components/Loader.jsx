const Loader = () => {
  return (
    <div className="loader-wrap">
      <div className="loader">
        <div className="loader-bar bar-1" />
        <div className="loader-bar bar-2" />
        <div className="loader-bar bar-3" />
        <div className="loader-bar bar-4" />
        <div className="loader-bar bar-5" />
      </div>
      <p className="loader-text">Fetching the latest stories for you…</p>
      <div className="skeleton-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line long" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;