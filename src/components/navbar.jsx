import Collections from "./Collections";

const Navbar = ({ setCategory, setCountry, useNewest, setUseNewest, onRefresh, searchTerm, setSearchTerm, darkMode, setDarkMode, currentUser, onLogout, onLoginClick }) => {
  return (
    <header className="navbar">
      <div className="nav-container nav-top">
        <div className="brand center-brand">
          <div className="logo-wrapper">
            <h1 className="logo">
              <span className="logo-text">⚡ HeadlineX ⚡</span>
            </h1>
            <p className="tagline">Breaking News at Speed of Light</p>
          </div>
        </div>

        <div className="header-controls">
          <div className="search-wrap">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search headlines..."
              className="search-input"
              aria-label="Search news"
            />
          </div>

          <div className="right-controls">
            <Collections />
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <label className="small-switch">
              <input type="checkbox" checked={useNewest} onChange={(e) => setUseNewest(e.target.checked)} />
              <span>Newest</span>
            </label>
            <button className="refresh-btn header-refresh" onClick={onRefresh}>🔄</button>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="user-profile">
                <div className="user-badge">
                  <span className="user-avatar">{currentUser.username[0].toUpperCase()}</span>
                  <span className="username-display">{currentUser.username}</span>
                </div>
                <button className="logout-btn" onClick={onLogout} title="Logout">
                  🚪
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={onLoginClick}>
                👤 Login
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="nav-container menu-row">
        <ul className="menu-list stretch">
          <li onClick={() => setCountry("us")}>🌍 Global</li>
          <li onClick={() => setCountry("in")}>🇮🇳 India</li>
          <li onClick={() => setCategory("general")}>📰 General</li>
          <li onClick={() => setCategory("business")}>💼 Business</li>
          <li onClick={() => setCategory("technology")}>🧠 Tech</li>
          <li onClick={() => setCategory("sports")}>🏅 Sports</li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
