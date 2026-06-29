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
  const [activeTab, setActiveTab] = useState("now-playing"); // "now-playing", "all-time"

  useScrollReveal();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("moviematch_token");
    const url = activeTab === "all-time" 
      ? `${API_BASE_URL}/api/discover/box-office?sort=all-time` 
      : `${API_BASE_URL}/api/discover/box-office`;
      
    fetch(url, {
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
  }, [activeTab]);

  return (
    <div className="page-content">
      <div className="section-header fade-in-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h2>{activeTab === "all-time" ? "All-Time Highest Grossing" : "Top Box Office"}</h2>
        <div className="tab-container" style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button 
            className={`btn-tab ${activeTab === 'now-playing' ? 'active' : ''}`}
            onClick={() => setActiveTab('now-playing')}
          >
            Currently Playing
          </button>
          <button 
            className={`btn-tab ${activeTab === 'all-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-time')}
          >
            All-Time Highest Grossing
          </button>
        </div>
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
              <div className="leaderboard-rank" style={{ display: activeTab === 'all-time' ? 'block' : 'none' }}>
                #{idx + 1}
              </div>
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
