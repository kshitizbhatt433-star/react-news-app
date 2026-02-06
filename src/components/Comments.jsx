import { useState, useEffect } from "react";

const Comments = ({ articleUrl, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Load comments from localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${articleUrl}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [articleUrl]);

  // Save comments to localStorage
  const saveComments = (updatedComments) => {
    setComments(updatedComments);
    localStorage.setItem(`comments_${articleUrl}`, JSON.stringify(updatedComments));
  };

  const handleAddComment = (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login to add comments");
      return;
    }

    if (!newComment.trim()) {
      alert("Please write a comment");
      return;
    }

    const comment = {
      id: Date.now(),
      author: currentUser.username,
      text: newComment,
      timestamp: new Date().toLocaleString(),
      likes: 0,
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment("");
  };

  const handleDeleteComment = (commentId) => {
    if (currentUser && comments.find((c) => c.id === commentId)?.author === currentUser.username) {
      const updatedComments = comments.filter((c) => c.id !== commentId);
      saveComments(updatedComments);
    } else {
      alert("You can only delete your own comments");
    }
  };

  const handleLikeComment = (commentId) => {
    const updatedComments = comments.map((c) =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    );
    saveComments(updatedComments);
  };

  return (
    <div className="comments-section">
      <button
        className="comments-toggle"
        onClick={() => setShowComments(!showComments)}
      >
        💬 Comments ({comments.length})
      </button>

      {showComments && (
        <div className="comments-container">
          {currentUser ? (
            <form className="comment-form" onSubmit={handleAddComment}>
              <div className="user-info">
                <span className="user-avatar">{currentUser.username[0].toUpperCase()}</span>
                <span className="username">{currentUser.username}</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this news..."
                className="comment-input"
                rows="3"
              ></textarea>
              <button type="submit" className="comment-submit">
                Post Comment
              </button>
            </form>
          ) : (
            <p className="login-prompt">Login to add comments</p>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-user">
                      <span className="comment-avatar">
                        {comment.author[0].toUpperCase()}
                      </span>
                      <div className="comment-info">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                    </div>
                    {currentUser?.username === comment.author && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button
                      className="like-btn"
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      👍 {comment.likes > 0 && comment.likes}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
