import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console or external service
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 28, textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: "#94a3b8" }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
