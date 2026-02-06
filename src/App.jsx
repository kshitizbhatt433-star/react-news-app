import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("in");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true" ? true : false;
    }
    return false;
  });

  // App-level controls moved here so Navbar can control them
  const [useNewest, setUseNewest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <>
      <Navbar
        setCategory={setCategory}
        setCountry={setCountry}
        useNewest={useNewest}
        setUseNewest={setUseNewest}
        onRefresh={handleRefresh}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <ErrorBoundary>
        <Home
          category={category}
          country={country}
          useNewest={useNewest}
          refreshKey={refreshKey}
          searchTerm={searchTerm}
        />
      </ErrorBoundary>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>Made with ❤️ — HeadlineX</span>
          <span>Data from NewsAPI.org</span>
        </div>
      </footer>
    </>
  );
}

export default App;
