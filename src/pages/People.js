import { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useScrollReveal } from "./BoxOffice";

export default function People() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorDetails, setActorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const handleActorClick = async (id) => {
    setSelectedActor(id);
    setActorDetails(null);
    setLoadingDetails(true);
    const token = localStorage.getItem("moviematch_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/discover/actor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActorDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

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
            <div key={item.id} className="list-card fade-in-scroll" style={{ transitionDelay: `${(idx % 5) * 0.1}s`, alignItems: 'center', cursor: 'pointer' }} onClick={() => handleActorClick(item.id)}>
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
                <button style={{ marginTop: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>View Details & Filmography &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedActor && (
        <div className="modal-backdrop" onClick={() => setSelectedActor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95vw', background: 'var(--bg-card)' }}>
            <button className="modal-close" onClick={() => setSelectedActor(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            {loadingDetails ? (
              <div className="modal-loading" style={{ padding: '40px', textAlign: 'center' }}><span className="spinner spinner-gold"></span><p>Loading details...</p></div>
            ) : actorDetails ? (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <img src={actorDetails.profile} alt={actorDetails.name} style={{ width: '160px', height: '240px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{actorDetails.name}</h2>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {actorDetails.birthday !== "Unknown" && <span>🎂 {actorDetails.birthday}</span>}
                      {actorDetails.place_of_birth !== "Unknown" && <span>📍 {actorDetails.place_of_birth}</span>}
                    </div>
                    {actorDetails.awards && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {actorDetails.awards.map(a => <span key={a} style={{ background: 'rgba(245,197,24,0.1)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>{a}</span>)}
                      </div>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto' }}>
                      {actorDetails.biography}
                    </p>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Filmography</h3>
                  <div className="carousel-track" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                    {actorDetails.credits && actorDetails.credits.length > 0 ? actorDetails.credits.map(c => (
                      <div key={c.id + c.mediaType} style={{ width: '120px', flexShrink: 0 }}>
                        <div style={{ width: '120px', height: '180px', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                          {c.poster ? <img src={c.poster} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.year} • {c.mediaType === 'tv' ? 'TV Series' : 'Movie'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.character}</div>
                      </div>
                    )) : <p>No credits available.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>Could not load actor details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
