const ShareButtons = ({ title, url }) => {
  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      default:
        break;
    }

    if (shareUrl) window.open(shareUrl, "_blank");
  };

  return (
    <div className="share-buttons">
      <button onClick={() => handleShare("twitter")} title="Share on Twitter" className="share-btn twitter">
        𝕏
      </button>
      <button onClick={() => handleShare("facebook")} title="Share on Facebook" className="share-btn facebook">
        f
      </button>
      <button onClick={() => handleShare("whatsapp")} title="Share on WhatsApp" className="share-btn whatsapp">
        💬
      </button>
      <button onClick={() => handleShare("email")} title="Share via Email" className="share-btn email">
        ✉️
      </button>
    </div>
  );
};

export default ShareButtons;
