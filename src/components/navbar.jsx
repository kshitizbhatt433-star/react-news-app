import { useState } from "react";

const CATEGORIES = [
  { label: "Intelligence", value: "general", emoji: "🕵️" },
  { label: "Live News", value: "youtube", emoji: "🔴" },
  { label: "Security", value: "business", emoji: "🔒" },
  { label: "Investigations", value: "entertainment", emoji: "🔍" },
  { label: "Analysis", value: "science", emoji: "📊" },
  { label: "Cyber Intel", value: "darkweb", emoji: "💻" },
  { label: "Social Media", value: "social", emoji: "📱" },
  { label: "Data Leaks", value: "leaks", emoji: "💀" },
  { label: "Reddit OSINT", value: "reddit", emoji: "🤖" },
  { label: "RSS Feeds", value: "rss", emoji: "📡" },
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
              <span className="logo-text">🕵️ OSINT India</span>
              <span className="logo-sticker">🕵️</span>
            </h1>
            <p className="tagline">Intelligence & News Analysis</p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* Search */}
          <div className="search-wrap">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍  Search intelligence reports..."
              className="search-input"
              aria-label="Search intelligence"
            />
          </div>

          <div className="right-controls">
            {/* OSINT Tools */}
            <div className="osint-tools">
              <button
                className="tool-btn"
                onClick={() => window.open('https://www.google.com/search?q=site:pastebin.com', '_blank')}
                title="Pastebin Search"
              >
                📋
              </button>
              <button
                className="tool-btn"
                onClick={() => window.open('https://haveibeenpwned.com/', '_blank')}
                title="Have I Been Pwned"
              >
                🔐
              </button>
              <button
                className="tool-btn"
                onClick={() => window.open('https://www.shodan.io/', '_blank')}
                title="Shodan Search"
              >
                🌐
              </button>
              <button
                className="tool-btn"
                onClick={() => window.open('https://www.maltego.com/', '_blank')}
                title="Maltego"
              >
                🕸️
              </button>
            </div>

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