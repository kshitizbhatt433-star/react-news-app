import { useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("in");

  // App-level controls moved here so Navbar can control them
  const [useNewest, setUseNewest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

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
          <span>Made with ❤️ — Newsify</span>
          <span>Data from NewsAPI.org</span>
        </div>
      </footer>
    </>
  );
}

export default App;
