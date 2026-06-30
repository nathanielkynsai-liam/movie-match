import { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useScrollReveal } from "./BoxOffice";

export default function Trending() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("week"); // "day", "week", "month", "year", "time-machine"
  const [timeMachineDate, setTimeMachineDate] = useState("1997-12"); // Default to Titanic era

  useScrollReveal([loading, items]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("moviematch_token");
    let url = "";
    if (activeTab === "time-machine") {
      url = `${API_BASE_URL}/api/discover/time-machine?date=${timeMachineDate}`;
    } else {
      url = `${API_BASE_URL}/api/discover/trending?period=${activeTab}`;
    }

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { 
        if (activeTab === "time-machine") {
          if (data.movies && data.actors) {
            setItems(data);
          } else {
            setError(data.error || "Failed to load Time Machine data");
          }
        } else {
          if (Array.isArray(data)) {
            setItems(data); 
          } else {
            setError(data.error || "Failed to load data");
          }
        }
        setLoading(false); 
      })
      .catch(err => { console.error(err); setError(err.message); setLoading(false); });
  }, [activeTab, timeMachineDate]);

  const renderMovieCard = (item, idx) => (
    <div key={item.id} className="list-card fade-in-scroll" style={{ transitionDelay: `${(idx % 5) * 0.1}s` }}>
      <div className="list-poster">
        {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
      </div>
      <div className="list-info">
        <h3>{item.title}</h3>
        <div className="list-meta">
          <span>{item.release_date && item.release_date !== "Unknown" ? item.release_date : item.year}</span>
          <span className="imdb-badge rating-high">★ {item.rating}</span>
        </div>
        <div className="list-plot">{item.overview}</div>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="section-header fade-in-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h2>
          {activeTab === "day" ? "Trending Today" : 
           activeTab === "week" ? "Trending This Week" : 
           activeTab === "month" ? "Trending Past Month" : 
           activeTab === "year" ? "Trending Past Year" : 
           "Time Machine ⏱️"}
        </h2>
        <div className="tab-container" style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button 
            className={`btn-tab ${activeTab === 'day' ? 'active' : ''}`}
            onClick={() => setActiveTab('day')}
          >
            Today
          </button>
          <button 
            className={`btn-tab ${activeTab === 'week' ? 'active' : ''}`}
            onClick={() => setActiveTab('week')}
          >
            This Week
          </button>
          <button 
            className={`btn-tab ${activeTab === 'month' ? 'active' : ''}`}
            onClick={() => setActiveTab('month')}
          >
            Past Month
          </button>
          <button 
            className={`btn-tab ${activeTab === 'year' ? 'active' : ''}`}
            onClick={() => setActiveTab('year')}
          >
            Past Year
          </button>
          <button 
            className={`btn-tab ${activeTab === 'time-machine' ? 'active' : ''}`}
            onClick={() => setActiveTab('time-machine')}
          >
            Time Machine ⏱️
          </button>
        </div>
      </div>

      {activeTab === "time-machine" && (
        <div className="time-machine-controls fade-in-scroll" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <label style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Select Era:</label>
          <input 
            type="month" 
            value={timeMachineDate}
            onChange={(e) => setTimeMachineDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'white', fontFamily: 'inherit' }}
          />
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="empty-state">
          <p style={{color: 'var(--danger)'}}>{error}</p>
          <p className="hint">Make sure you have added TMDB_API_KEY to your .env and restarted the server.</p>
        </div>
      ) : activeTab === "time-machine" && items.movies ? (
        <div className="time-machine-results fade-in-scroll" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <span style={{color: 'var(--primary)'}}>🎬</span> Blockbusters of {new Date(timeMachineDate + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="media-list">
            {items.movies.map(renderMovieCard)}
          </div>
          
          <h3 style={{ marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <span style={{color: 'var(--gold)'}}>⭐</span> Stars of the Era
          </h3>
          <div className="media-list">
            {items.actors.map((actor, idx) => (
              <div key={actor.id} className="list-card fade-in-scroll" style={{ transitionDelay: `${(idx % 5) * 0.1}s`, alignItems: 'center' }}>
                <div className="list-poster" style={{ borderRadius: '50%', width: '80px', height: '80px', overflow: 'hidden', flexShrink: 0, margin: '16px' }}>
                  {actor.poster ? <img src={actor.poster} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
                </div>
                <div className="list-info" style={{ paddingLeft: '0' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{actor.name}</h3>
                  <div className="list-meta" style={{ color: 'var(--text-secondary)' }}>
                    <span>Trending Role: {actor.role || 'Various Roles'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="media-list">
          {items.map(renderMovieCard)}
        </div>
      )}
    </div>
  );
}
