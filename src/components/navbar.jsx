import { useState } from "react";

const CATEGORIES = [
  { label: "Top Stories", value: "general", emoji: "📰" },
  { label: "India", value: "india", emoji: "🇮🇳" },
  { label: "World", value: "world", emoji: "🌍" },
  { label: "Politics", value: "politics", emoji: "🏛️" },
  { label: "Business", value: "business", emoji: "💼" },
  { label: "Technology", value: "technology", emoji: "💡" },
  { label: "Sports", value: "sports", emoji: "🏏" },
  { label: "Entertainment", value: "entertainment", emoji: "🎬" },
  { label: "Bollywood", value: "bollywood", emoji: "🎥" },
  { label: "Science", value: "science", emoji: "🔬" },
  { label: "Health", value: "health", emoji: "💊" },
];

const COUNTRIES = [
  { label: "India", value: "in", emoji: "🇮🇳" },
];

const Navbar = ({
  setCategory,
  setCountry,
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
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
              <span className="logo-text">� HeadlineX</span>
              <span className="logo-sticker">📰</span>
            </h1>
            <p className="tagline">Trusted headlines, instantly.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* Search */}
          <div className="search-wrap">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍  Search headlines, topics, sources..."
              className="search-input"
              aria-label="Search headlines"
            />
          </div>

          <div className="right-controls">
            {/* Dark mode */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

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