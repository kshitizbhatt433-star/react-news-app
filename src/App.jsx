import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthModal from "./components/AuthModal";

function App() {
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("in");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true" ? true : false;
    }
    return false;
  });

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Handle login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

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
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <ErrorBoundary>
        <Home
          category={category}
          country={country}
          useNewest={useNewest}
          refreshKey={refreshKey}
          searchTerm={searchTerm}
          currentUser={currentUser}
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
