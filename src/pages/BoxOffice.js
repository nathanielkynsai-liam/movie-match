import { useEffect, useState } from "react";
import API_BASE_URL from "../config";

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    // Add small delay to let DOM render
    setTimeout(() => {
      const elements = document.querySelectorAll(".fade-in-scroll");
      elements.forEach((el) => observer.observe(el));
    }, 100);
    return () => observer.disconnect();
  });
}

export default function BoxOffice() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useScrollReveal();

  useEffect(() => {
    const token = localStorage.getItem("moviematch_token");
    fetch(`${API_BASE_URL}/api/discover/box-office`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setItems(data); 
        } else {
          setError(data.error || "Failed to load data");
        }
        setLoading(false); 
      })
      .catch(err => { console.error(err); setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="page-content">
      <div className="section-header fade-in-scroll">
        <h2>Top Box Office</h2>
      </div>
      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="empty-state">
          <p style={{color: 'var(--danger)'}}>{error}</p>
          <p className="hint">Make sure you have added TMDB_API_KEY to your .env and restarted the server.</p>
        </div>
      ) : (
        <div className="media-list">
          {items.map((item, idx) => (
            <div key={item.id} className="list-card fade-in-scroll" style={{ transitionDelay: `${(idx % 5) * 0.1}s` }}>
              <div className="list-poster">
                <img src={item.poster} alt={item.title} />
              </div>
              <div className="list-info">
                <h3>{item.title}</h3>
                <div className="list-meta">
                  <span>{item.release_date && item.release_date !== "Unknown" ? item.release_date : item.year}</span>
                  <span className="imdb-badge rating-mid" style={{color: '#F5C518'}}>🔥 {item.boxOffice}</span>
                </div>
                <div className="list-plot">{item.overview}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
