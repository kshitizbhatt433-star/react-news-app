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
    </div>
  );
};

export default Loader;