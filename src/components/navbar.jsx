const Navbar = ({ setCategory, setCountry, useNewest, setUseNewest, onRefresh, searchTerm, setSearchTerm }) => {
  return (
    <header className="navbar">
      <div className="nav-container nav-top">
        <div className="brand center-brand">
          <h1 className="logo">🗞️ <strong>Newsify</strong></h1>
        </div>

        <div className="header-controls">
          <div className="search-wrap">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search headlines, descriptions..."
              className="search-input"
              aria-label="Search news"
            />
          </div>

          <div className="right-controls">
            <label className="small-switch">
              <input type="checkbox" checked={useNewest} onChange={(e) => setUseNewest(e.target.checked)} />
              <span>Newest</span>
            </label>
            <button className="refresh-btn header-refresh" onClick={onRefresh}>🔄 Refresh</button>
          </div>
        </div>
      </div>

      <nav className="nav-container menu-row">
        <ul className="menu-list stretch">
          <li onClick={() => setCountry("us")}>🌍 Global</li>
          <li onClick={() => setCountry("in")}>🇮🇳 India</li>
          <li onClick={() => setCategory("general")}>📰 General</li>
          <li onClick={() => setCategory("business")}>💼 Business</li>
          <li onClick={() => setCategory("technology")}>🧠 Technology</li>
          <li onClick={() => setCategory("sports")}>🏅 Sports</li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
