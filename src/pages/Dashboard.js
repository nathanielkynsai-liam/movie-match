import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { useScrollReveal } from "./BoxOffice";

/* ═══════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════ */

function FilmIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#F5C518" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#F5C518" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="5" r="1.2" fill="#F5C518" />
      <circle cx="12" cy="19" r="1.2" fill="#F5C518" />
      <circle cx="5" cy="12" r="1.2" fill="#F5C518" />
      <circle cx="19" cy="12" r="1.2" fill="#F5C518" />
      <circle cx="7.05" cy="7.05" r="1" fill="#F5C518" />
      <circle cx="16.95" cy="7.05" r="1" fill="#F5C518" />
      <circle cx="7.05" cy="16.95" r="1" fill="#F5C518" />
      <circle cx="16.95" cy="16.95" r="1" fill="#F5C518" />
    </svg>
  );
}

function StarIcon({ filled = true }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#F5C518" : "none"} stroke="#F5C518" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// IMDB-style rating badge
function RatingBadge({ rating }) {
  const r = Number(rating) || 0;
  let colorClass = "rating-low";
  if (r >= 7) colorClass = "rating-high";
  else if (r >= 5) colorClass = "rating-mid";

  return (
    <span className={`imdb-badge ${colorClass}`}>
      <StarIcon filled={true} />
      <span>{r.toFixed(1)}</span>
    </span>
  );
}

// Format Media Type Badge
function MediaTypeBadge({ type }) {
  if (!type) return null;
  const t = type.toLowerCase();
  let label = type;
  if (t === "series") label = "Series";
  if (t === "movie") label = "Movie";
  if (t === "anime") label = "Anime";
  return <span className={`media-badge type-${t}`}>{label}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  useScrollReveal();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTypeFilter, setSearchTypeFilter] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Top Rated State
  const [topRated, setTopRated] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [topRatedType, setTopRatedType] = useState('movie'); // 'movie' or 'series'

  // Recommended State
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Genres State
  const [genres, setGenres] = useState([]);

  // Watchlist & Favorites State
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Result details modal state
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultDetails, setResultDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: {
        chat_response: "Hello. I am your Oracle Assistant. I can recommend amazing movies and directors for you to discover.",
        recommendations: []
      }
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef(null);

  // Get logged-in user and token
  const user = JSON.parse(localStorage.getItem("moviematch_user") || "null");
  const token = localStorage.getItem("moviematch_token");

  // Helper: create auth headers for API requests
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const logout = () => {
    localStorage.removeItem("moviematch_token");
    localStorage.removeItem("moviematch_user");
    navigate("/");
  };

  // Fetch Recommended and Genres once on mount
  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_BASE_URL}/api/discover/recommended`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecommended(data);
        setLoadingRecommended(false);
      })
      .catch(err => {
        console.error("Failed to load recommended:", err);
        setLoadingRecommended(false);
      });

    fetch(`${API_BASE_URL}/api/discover/genres`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGenres(data);
      })
      .catch(err => console.error("Failed to load genres:", err));

    // Fetch Watchlist
    fetch(`${API_BASE_URL}/api/watchlist`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWatchlist(data);
        setLoadingWatchlist(false);
      })
      .catch(err => {
        console.error("Failed to load watchlist:", err);
        setLoadingWatchlist(false);
      });

    // Fetch Favorites/Rated Movies
    fetch(`${API_BASE_URL}/api/movies`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFavorites(data);
        setLoadingFavorites(false);
      })
      .catch(err => {
        console.error("Failed to load favorites:", err);
        setLoadingFavorites(false);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }
    
    // Fetch Top Rated
    setLoadingTopRated(true);
    fetch(`${API_BASE_URL}/api/discover/${topRatedType === 'movie' ? 'top-rated' : 'top-rated-series'}`, {
      headers: authHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTopRated(data);
        setLoadingTopRated(false);
      })
      .catch(err => {
        console.error("Failed to load top rated:", err);
        setLoadingTopRated(false);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, navigate, topRatedType]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ── SEARCH LOGIC ──
  const performSearch = (q, typeFilter) => {
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setShowSearchResults(true);
    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        let url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(q)}`;
        if (typeFilter !== "all") {
          url += `&type=${typeFilter}`;
        }

        const res = await fetch(url, { headers: authHeaders() });
        
        if (res.status === 401) {
          logout();
          return;
        }

        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    performSearch(q, searchTypeFilter);
  };

  const handleFilterChange = (e) => {
    const type = e.target.value;
    setSearchTypeFilter(type);
    performSearch(searchQuery, type);
  };

  const handleResultClick = async (result) => {
    setShowSearchResults(false);
    setSelectedResult(result);
    setLoadingDetails(true);

    try {
      // Create a fallback id if we only have a tmdb id but no imdb id in the object yet
      let searchId = result.imdbID;
      // Note: topRated results don't have imdbID natively, they have TMDB id.
      // The backend /details endpoint handles this gracefully if we pass title and year instead!
      
      const [omdbRes, tmdbRes] = await Promise.all([
        searchId ? fetch(`${API_BASE_URL}/api/search/${searchId}`, { headers: authHeaders() }) : Promise.resolve({ ok: false }),
        fetch(`${API_BASE_URL}/api/discover/details`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ imdbID: searchId, title: result.title, year: result.year, type: result.mediaType })
        }).catch(err => { console.error(err); return { ok: false }; })
      ]);

      if (omdbRes.status === 401 || tmdbRes.status === 401) return logout();

      let details = {
        title: result.title,
        year: result.year,
        mediaType: result.mediaType,
        poster: result.poster
      };
      
      if (omdbRes.ok) {
        const omdbData = await omdbRes.json();
        details = { ...details, ...omdbData };
      }

      if (tmdbRes.ok) {
        try {
          const tmdbData = await tmdbRes.json();
          details.tmdbCast = tmdbData.cast;
          details.tmdbTrailer = tmdbData.trailer;
          details.tmdbSimilar = tmdbData.similar;
          if (!details.plot || details.plot === "N/A") details.plot = tmdbData.overview;
        } catch (e) {
          console.error("Error parsing TMDB details:", e);
        }
      }

      setResultDetails(details);
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ── AI CHAT LOGIC ──
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput;
    setChatInput("");
    await submitChatMessage(msg);
  };

  const submitChatMessage = async (messageText) => {
    const newMsg = { role: "user", content: messageText };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatLoading(true);
    setChatError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: messageText, context: [] }),
      });

      if (res.status === 401) return logout();
      if (!res.ok) throw new Error("AI request failed");

      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatError("The Oracle is currently unavailable. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const triggerGenreSearch = (genreName) => {
    submitChatMessage(`Recommend some popular ${genreName} movies`);
  };

  const handleChipClick = (msg) => {
    setChatInput(msg);
  };

  const quickChips = [
    "Best sci-fi movies?",
    "Recommend a thriller"
  ];

  return (
    <div className="dashboard-layout">
      <div className="page-content dashboard-two-column">
        
        {/* ── Main Feed (Left 70%) ── */}
        <div className="main-feed">
          
          {/* Genres Row */}
          {genres.length > 0 && (
            <div className="genres-row fade-in-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
              {genres.map(g => (
                <button key={g.id} className="pill" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }} onClick={() => triggerGenreSearch(g.name)}>
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Search Section */}
          <div className="search-section search-container fade-in-scroll" style={{ marginTop: '0' }}>
            <div className="search-bar-container">
              <div className="search-wrapper">
                <SearchIcon className="search-icon-wrapper" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search movies or TV shows..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchQuery) setShowSearchResults(true) }}
                />
                
                {/* Dropdown Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results-overlay">
                    {searchResults.map((res, i) => (
                      <div key={i} className="result-card" onClick={() => handleResultClick(res)}>
                        {res.poster && res.poster !== "N/A" ? (
                          <img src={res.poster} alt={res.title} className="result-poster" />
                        ) : (
                          <div className="result-poster" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <FilmIcon size={24} />
                          </div>
                        )}
                        <div className="result-info">
                          <h4>{res.title}</h4>
                          <p>{res.year} &bull; <span style={{textTransform: 'capitalize'}}>{res.mediaType}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="search-results-overlay">
                    <div className="no-results">No results found for "{searchQuery}"</div>
                  </div>
                )}
              </div>
            </div>
            <div className="filter-pills">
              <button className={`pill ${searchTypeFilter === 'all' ? 'active' : ''}`} onClick={handleFilterChange} value="all">All</button>
              <button className={`pill ${searchTypeFilter === 'movie' ? 'active' : ''}`} onClick={handleFilterChange} value="movie">Movies</button>
              <button className={`pill ${searchTypeFilter === 'series' ? 'active' : ''}`} onClick={handleFilterChange} value="series">TV Shows</button>
            </div>
          </div>

          {/* Recommended Carousel Section */}
          <div className="fade-in-scroll">
            <h2 className="section-title">
              <span style={{color: 'var(--primary)'}}>✨</span> Movies for You
            </h2>
            {loadingRecommended ? (
              <div className="spinner"></div>
            ) : recommended.length > 0 ? (
              <div className="carousel-container">
                <div className="carousel-track">
                  {recommended.map((item, idx) => (
                    <div key={item.id} className="carousel-card" onClick={() => handleResultClick({...item, mediaType: 'movie'})}>
                      <div className="carousel-poster">
                        {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
                      </div>
                      <div className="carousel-info">
                        <h4>{item.title}</h4>
                        <div className="carousel-meta">
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{item.year}</span>
                          <RatingBadge rating={item.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{color: 'var(--text-muted)'}}>No recommendations found.</p>
            )}
          </div>

          {/* Watchlist Carousel Section */}
          <div className="fade-in-scroll">
            <h2 className="section-title">
              <span style={{color: 'var(--primary)'}}>📌</span> Your Watchlist
            </h2>
            {loadingWatchlist ? (
              <div className="spinner"></div>
            ) : watchlist.length > 0 ? (
              <div className="carousel-container">
                <div className="carousel-track">
                  {watchlist.map((item) => (
                    <div key={item._id} className="carousel-card" onClick={() => handleResultClick({...item, mediaType: item.mediaType || 'movie'})}>
                      <div className="carousel-poster">
                        {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
                      </div>
                      <div className="carousel-info">
                        <h4>{item.title}</h4>
                        <div className="carousel-meta">
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{item.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>Your watchlist is empty.</p>
            )}
          </div>

          {/* Favorites Carousel Section */}
          <div className="fade-in-scroll">
            <h2 className="section-title">
              <span style={{color: 'var(--primary)'}}>⭐</span> Your Rated Movies
            </h2>
            {loadingFavorites ? (
              <div className="spinner"></div>
            ) : favorites.length > 0 ? (
              <div className="carousel-container">
                <div className="carousel-track">
                  {favorites.map((item) => (
                    <div key={item._id} className="carousel-card" onClick={() => handleResultClick({...item, mediaType: 'movie'})}>
                      <div className="carousel-poster">
                        {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
                      </div>
                      <div className="carousel-info">
                        <h4>{item.title}</h4>
                        <div className="carousel-meta">
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{item.year}</span>
                          <RatingBadge rating={item.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>You haven't rated any movies yet.</p>
            )}
          </div>

          {/* Top Rated Carousel Section */}
          <div className="fade-in-scroll">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
              <h2 className="section-title" style={{marginBottom: 0}}>
                <span style={{color: 'var(--gold)'}}>{topRatedType === 'movie' ? '🏆' : '📺'}</span> Best {topRatedType === 'movie' ? 'Movies' : 'Series'} of All Time
              </h2>
              <div className="filter-pills" style={{marginTop: 0}}>
                <button className={`pill ${topRatedType === 'movie' ? 'active' : ''}`} onClick={() => setTopRatedType('movie')}>Movies</button>
                <button className={`pill ${topRatedType === 'series' ? 'active' : ''}`} onClick={() => setTopRatedType('series')}>TV Shows</button>
              </div>
            </div>
            {loadingTopRated ? (
              <div className="spinner"></div>
            ) : topRated.length > 0 ? (
              <div className="carousel-container">
                <div className="carousel-track">
                  {topRated.map((item, idx) => (
                    <div key={item.id} className="carousel-card" onClick={() => handleResultClick({...item, mediaType: topRatedType})}>
                      <div className="carousel-poster">
                        <div className="carousel-rank">#{idx + 1}</div>
                        {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{background: 'var(--bg-surface)', width: '100%', height: '100%'}}></div>}
                      </div>
                      <div className="carousel-info">
                        <h4>{item.title}</h4>
                        <div className="carousel-meta">
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{item.year}</span>
                          <RatingBadge rating={item.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{color: 'var(--text-muted)'}}>No top rated found.</p>
            )}
          </div>
        </div>

        {/* ── AI Sidebar (Right 30%) ── */}
        <div className="ai-sidebar fade-in-scroll">
          <div className="ai-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="ai-title">Oracle Assistant</div>
              <div className="ai-subtitle">Powered by Groq &middot; LLaMA-3</div>
            </div>
          </div>

          <div className="ai-messages" style={{ flex: 1, overflowY: 'auto' }}>
            {chatMessages.map((msg, idx) =>
              msg.role === "assistant" ? (
                <div key={idx} className="ai-msg">
                  <div className="ai-msg-header">
                    <span className="ai-msg-label" style={{fontWeight: 700}}>Oracle Assistant</span>
                  </div>
                  <div className="ai-msg-oracle">
                    {typeof msg.content === "object" ? (
                      <>
                        <div className="ai-chat-response">{msg.content.chat_response}</div>
                        {msg.content.recommendations && msg.content.recommendations.length > 0 && (
                          <div className="ai-recommendations">
                            {msg.content.recommendations.map((rec, i) => (
                              <div key={i} className="ai-rec-card" onClick={() => handleResultClick(rec)}>
                                {rec.poster && (
                                  <div className="ai-rec-poster">
                                    <img src={rec.poster} alt={rec.title} />
                                  </div>
                                )}
                                <div className="ai-rec-content">
                                  <div className="ai-rec-header">
                                    <span className="ai-rec-title">{rec.title}</span>
                                    {rec.year && <span className="ai-rec-year">({rec.year})</span>}
                                    {rec.mediaType && <MediaTypeBadge type={rec.mediaType} />}
                                  </div>
                                  {rec.genres && rec.genres.length > 0 && (
                                    <div className="ai-rec-genres">{rec.genres.join(", ")}</div>
                                  )}
                                  <div className="ai-rec-justification">{rec.justification}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div key={idx} className="ai-msg ai-msg-user">
                  <div className="ai-msg-header" style={{justifyContent: 'flex-end'}}>
                    <span className="ai-msg-label">{user?.username}</span>
                  </div>
                  <div className="ai-msg-content">{msg.content}</div>
                </div>
              )
            )}
            
            {chatLoading && (
              <div className="ai-msg">
                <div className="ai-msg-header">
                  <span className="ai-msg-label" style={{fontWeight: 700}}>Oracle Assistant</span>
                </div>
                <div className="ai-msg-oracle" style={{ display: 'flex', gap: '8px' }}>
                  <span className="spinner spinner-light" style={{ width: '16px', height: '16px' }}></span>
                  <span style={{color: 'var(--text-muted)'}}>Thinking...</span>
                </div>
              </div>
            )}
            
            {chatError && (
              <div className="ai-msg">
                <div className="ai-msg-oracle" style={{ color: 'var(--danger)', borderLeft: '2px solid var(--danger)' }}>
                  {chatError}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '0 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', zIndex: 10 }}>
            <div className="ai-chips" style={{ marginBottom: '8px', marginTop: '12px' }}>
              {quickChips.map((chip, idx) => (
                <button key={idx} className="ai-chip" onClick={() => handleChipClick(chip)} disabled={chatLoading}>{chip}</button>
              ))}
            </div>

            <form className="ai-input-row" onSubmit={handleChatSubmit} style={{ paddingBottom: '16px' }}>
              <input id="ai-chat-input" placeholder="Ask for recommendations..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={chatLoading} />
              <button type="submit" className="btn-arcane" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <span className="spinner spinner-light"></span> : "\u2726 Ask"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Search Details Modal ── */}
      {selectedResult && (
        <div className="modal-backdrop" onClick={() => setSelectedResult(null)}>
          <div className="modal-content result-details-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedResult(null)}>
              <CloseIcon />
            </button>
            
            {loadingDetails ? (
              <div className="modal-loading">
                <span className="spinner spinner-gold"></span>
                <p>Loading details...</p>
              </div>
            ) : resultDetails ? (
              <div className="details-layout">
                <div className="details-poster">
                  {resultDetails.poster ? (
                    <img src={resultDetails.poster} alt={resultDetails.title} />
                  ) : (
                    <div className="poster-placeholder"><FilmIcon size={40}/></div>
                  )}
                </div>
                <div className="details-info">
                  <div className="details-header">
                    <h2>{resultDetails.title}</h2>
                    <div className="details-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {resultDetails.imdbRating && resultDetails.imdbRating !== "N/A" && (
                        <RatingBadge rating={resultDetails.imdbRating} />
                      )}
                      {resultDetails.year && <span>{resultDetails.year}</span>}
                      {resultDetails.runtime && resultDetails.runtime !== "N/A" && <span>&bull; {resultDetails.runtime}</span>}
                      <MediaTypeBadge type={resultDetails.mediaType} />
                    </div>
                    {resultDetails.Awards && resultDetails.Awards !== "N/A" && (
                      <div className="details-awards-badge" style={{ marginTop: '8px', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏆</span> <span>{resultDetails.Awards}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="details-body">
                    {resultDetails.plot && resultDetails.plot !== "N/A" && <p className="plot">{resultDetails.plot}</p>}
                    
                    <div className="details-grid">
                      {resultDetails.genre && resultDetails.genre !== "N/A" && (
                        <div><span className="label">Genre:</span> {resultDetails.genre}</div>
                      )}
                      {resultDetails.director && resultDetails.director !== "N/A" && (
                        <div><span className="label">Director:</span> {resultDetails.director}</div>
                      )}
                      {resultDetails.tmdbCast && resultDetails.tmdbCast.length > 0 ? (
                        <div style={{gridColumn: "1 / -1", marginTop: '16px'}}>
                           <span className="label" style={{display: 'block', marginBottom: '8px'}}>Top Cast:</span>
                           <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px'}}>
                              {resultDetails.tmdbCast.map((c, i) => (
                                 <div key={i} style={{width: '60px', flexShrink: 0, textAlign: 'center'}}>
                                    {c.profile ? <img src={c.profile} alt={c.name} style={{width: '100%', borderRadius: '4px', aspectRatio: '2/3', objectFit: 'cover'}} /> : <div style={{width: '100%', aspectRatio: '2/3', background: 'var(--bg-surface)', borderRadius: '4px'}}></div>}
                                    <div style={{fontSize: '0.7rem', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)'}}>{c.name}</div>
                                    <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.character}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                      ) : (
                        resultDetails.actors && resultDetails.actors !== "N/A" && (
                          <div style={{gridColumn: "1 / -1"}}><span className="label">Cast:</span> {resultDetails.actors}</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="modal-error">Could not load details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}