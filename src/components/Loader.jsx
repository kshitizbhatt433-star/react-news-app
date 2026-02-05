import React from "react";

const Loader = () => {
	return (
		<div className="loader-wrap">
			<div className="loader">
				<div className="dot dot-1">📰</div>
				<div className="dot dot-2">✨</div>
				<div className="dot dot-3">🔎</div>
			</div>
			<p className="loader-text">Fetching the latest stories for you…</p>
		</div>
	);
};

export default Loader;
