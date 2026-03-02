import { useState } from "react";
import Collections from "./Collections";

const CATEGORIES = [
  { label: "General", value: "general", emoji: "📰" },
  { label: "Business", value: "business", emoji: "💼" },
  { label: "Technology", value: "technology", emoji: "🧠" },
  { label: "Sports", value: "sports", emoji: "🏅" },
  { label: "Health", value: "health", emoji: "🩺" },
  { label: "Entertainment", value: "entertainment", emoji: "🎬" },
  { label: "Science", value: "science", emoji: "🔬" },
];

const COUNTRIES = [
  { label: "Global", value: "us", emoji: "🌍" },
  { label: "India", value: "in", emoji: "🇮🇳" },
  { label: "UK", value: "gb", emoji: "🇬🇧" },
  { label: "Australia", value: "au", emoji: "🇦🇺" },
];

const Navbar = ({
  setCategory,
  setCountry,
  useNewest,
  setUseNewest,
  onRefresh,
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  onLoginClick,
  activeCategory,
  activeCountry,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCategory = (val) => {
    setCategory(val);
    setMenuOpen(false);
  };

  const handleCountry = (val) => {
    setCountry(val);
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      {/* Top Row: Brand + Controls */}
      <div className="nav-container nav-top">
        {/* Brand */}
        <div className="brand center-brand">
          <div className="logo-wrapper">
            <h1 className="logo">
              <span className="logo-text">⚡ HeadlineX</span>
              <span className="logo-sticker">⚡</span>
            </h1>
            <p className="tagline">Breaking News at Speed of Light</p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* Search */}
          <div className="search-wrap">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍  Search headlines..."
              className="search-input"
              aria-label="Search news"
            />
          </div>

          <div className="right-controls">
            <Collections />

            {/* Newest toggle */}
            <label className="small-switch" title="Sort by newest">
              <input
                type="checkbox"
                checked={useNewest}
                onChange={(e) => setUseNewest(e.target.checked)}
              />
              <span>Newest</span>
            </label>

            {/* Refresh */}
            <button
              className="refresh-btn header-refresh"
              onClick={onRefresh}
              title="Refresh news"
              aria-label="Refresh"
            >
              🔄
            </button>

            {/* Dark mode */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* User */}
            {currentUser ? (
              <div className="user-profile">
                <div className="user-badge">
                  <span className="user-avatar">
                    {currentUser.username[0].toUpperCase()}
                  </span>
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

            {/* Mobile hamburger */}
            <button
              className="theme-toggle mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{ display: "none" }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className={`nav-container menu-row${menuOpen ? " menu-open" : ""}`}>
        <ul className="menu-list stretch">
          {/* Countries */}
          {COUNTRIES.map((c) => (
            <li
              key={c.value}
              onClick={() => handleCountry(c.value)}
              className={activeCountry === c.value ? "menu-active" : ""}
              title={`News from ${c.label}`}
            >
              {c.emoji} {c.label}
            </li>
          ))}

          {/* Divider */}
          <li className="menu-divider" aria-hidden="true">|</li>

          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <li
              key={cat.value}
              onClick={() => handleCategory(cat.value)}
              className={activeCategory === cat.value ? "menu-active" : ""}
            >
              {cat.emoji} {cat.label}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;