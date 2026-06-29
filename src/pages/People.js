import { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useScrollReveal } from "./BoxOffice"; // reuse hook

export default function People() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useScrollReveal();

  useEffect(() => {
    const token = localStorage.getItem("moviematch_token");
    fetch(`${API_BASE_URL}/api/discover/people`, {
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
        <h2>Popular Directors & Actors</h2>
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
            <div key={item.id} className="list-card fade-in-scroll" style={{ transitionDelay: `${(idx % 5) * 0.1}s`, alignItems: 'center' }}>
              <div className="leaderboard-rank">
                #{idx + 1}
              </div>
              <div className="list-poster">
                <img src={item.poster} alt={item.name} style={{ objectPosition: "top" }} />
              </div>
              <div className="list-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <div className="imdb-badge rating-high" style={{ padding: '4px 8px' }}>🔥 {item.popularity} pts</div>
                </div>
                <div className="list-meta" style={{ marginBottom: "8px" }}>
                  <span className="media-badge">{item.role}</span>
                  {item.birthday && item.birthday !== "Unknown" && <span>&bull; Born {item.birthday}</span>}
                  {item.awards && item.awards.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginLeft: '8px' }}>
                      {item.awards.map((award, aIdx) => (
                        <span key={aIdx} style={{ fontSize: '0.7rem', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(245, 197, 24, 0.2)' }}>
                          {award}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {item.knownFor && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Known for:</strong> {item.knownFor}
                  </div>
                )}
                <div className="list-bio">{item.biography}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
