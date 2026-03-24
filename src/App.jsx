import { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";

/* ── Scroll-to-top button ── */
function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      className="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}

/* ── Toast notification ── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

/* ── Page transition wrapper ── */
function PageFade({ children, id }) {
  return (
    <div key={id} className="page-fade">
      {children}
    </div>
  );
}

function App() {
  const [category, setCategory]   = useState("general");
  const [country, setCountry]     = useState("in");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast]         = useState(null);
  const [pageKey, setPageKey]     = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const prevCategory = useRef(category);
  const prevCountry  = useRef(country);

  /* Dark mode */
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  /* Toast + page fade on category/country change */
  useEffect(() => {
    if (prevCategory.current !== category || prevCountry.current !== country) {
      setPageKey((k) => k + 1);
      prevCategory.current = category;
      prevCountry.current  = country;
    }
  }, [category, country]);

  /* Handlers */
  const handleCategoryChange = (val) => {
    setCategory(val);
    setToast(`📰 Switched to ${val.charAt(0).toUpperCase() + val.slice(1)}`);
  };

  const handleCountryChange = (val) => {
    setCountry(val);
    setToast(`🇮🇳 Showing news from India`);
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <Navbar
        setCategory={handleCategoryChange}
        setCountry={handleCountryChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeCategory={category}
        activeCountry={country}
      />

      <ErrorBoundary>
        <PageFade id={pageKey}>
          <Home
            category={category}
            country={country}
            refreshKey={refreshKey}
            searchTerm={searchTerm}
          />
        </PageFade>
      </ErrorBoundary>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {currentYear} <strong>OSINT India</strong> — Open Source Intelligence Platform 🕵️</span>
          <span>Powered by <a href="https://newsapi.org" target="_blank" rel="noreferrer" className="footer-link">NewsAPI.org</a></span>
        </div>
      </footer>

      <ScrollTop />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export default App;