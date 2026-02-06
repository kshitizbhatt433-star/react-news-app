import { useState } from "react";

const Collections = () => {
  const [showModal, setShowModal] = useState(false);
  const [savedArticles, setSavedArticles] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("savedArticles") || "[]");
    }
    return [];
  });

  const handleClose = () => setShowModal(false);

  return (
    <>
      <button className="collections-btn" onClick={() => setShowModal(true)} title="View saved articles">
        📚 Collections ({savedArticles.length})
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📚 My Collections</h2>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-body">
              {savedArticles.length === 0 ? (
                <p className="empty-msg">No saved articles yet. Start saving articles to build your collection!</p>
              ) : (
                <p className="collection-info">You have {savedArticles.length} saved article(s)</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Collections;
