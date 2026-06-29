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
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function BookmarkIcon({ filled = false }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTypeFilter, setSearchTypeFilter] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [topRated, setTopRated] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [topRatedType, setTopRatedType] = useState("movie");
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [genres, setGenres] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [selectedResult, setSelectedResult] = useState(null);
  const [resultDetails, setResultDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchlistMsg, setWatchlistMsg] = useState("");
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: { chat_response: "Hello. I am your Oracle Assistant. I can recommend amazing movies and directors for you to discover.", recommendations: [] } },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("moviematch_user") || "null");
  const token = localStorage.getItem("moviematch_token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  const logout = () => {
    localStorage.removeItem("moviematch_token");
    localStorage.removeItem("moviematch_user");
    navigate("/");
  };

  useEffect(() => {
    if (!user || !token) return;
    const headers = authHeaders();

    fetch(`${API_BASE_URL}/api/discover/recommended`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setRecommended(data); setLoadingRecommended(false); })
      .catch(() => setLoadingRecommended(false));

    fetch(`${API_BASE_URL}/api/discover/genres`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setGenres(data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/watchlist`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setWatchlist(data); setLoadingWatchlist(false); })
      .catch(() => setLoadingWatchlist(false));

    fetch(`${API_BASE_URL}/api/movies`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setFavorites(data); setLoadingFavorites(false); })
      .catch(() => setLoadingFavorites(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || !token) { navigate("/"); return; }
    setLoadingTopRated(true);
    const endpoint = topRatedType === "movie" ? "top-rated" : "top-rated-series";
    fetch(`${API_BASE_URL}/api/discover/${endpoint}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setTopRated(data); setLoadingTopRated(false); })
      .catch(() => setLoadingTopRated(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topRatedType]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => { if (!e.target.closest(".search-container")) setShowSearchResults(false); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const performSearch = (q, typeFilter) => {
    if (!q.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
    setShowSearchResults(true); setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        let url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(q)}`;
        if (typeFilter !== "all") url += `&type=${typeFilter}`;
        const res = await fetch(url, { headers: authHeaders() });
        if (res.status === 401) return logout();
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) { console.error("Search failed:", err); }
      finally { setIsSearching(false); }
    }, 400);
  };

  const handleSearchChange = (e) => { const q = e.target.value; setSearchQuery(q); performSearch(q, searchTypeFilter); };
  const handleFilterChange = (val) => { setSearchTypeFilter(val); performSearch(searchQuery, val); };

  const handleResultClick = async (result) => {
    setShowSearchResults(false);
    setSelectedResult(result);
    setResultDetails(null);
    setLoadingDetails(true);
    setShowTrailer(false);
    setWatchlistMsg("");

    try {
      const searchId = result.imdbID;
      const [omdbRes, tmdbRes] = await Promise.all([
        searchId ? fetch(`${API_BASE_URL}/api/search/${searchId}`, { headers: authHeaders() }) : Promise.resolve({ ok: false }),
        fetch(`${API_BASE_URL}/api/discover/details`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ imdbID: searchId, title: result.title, year: result.year, type: result.mediaType })
        }).catch(() => ({ ok: false }))
      ]);

      if (omdbRes.status === 401 || tmdbRes.status === 401) return logout();

      let details = { title: result.title, year: result.year, mediaType: result.mediaType, poster: result.poster };

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
          details.tmdbGenres = tmdbData.genres;
          if (!details.plot || details.plot === "N/A") details.plot = tmdbData.overview;
          if (!details.director || details.director === "N/A") details.director = tmdbData.director;
        } catch (e) { console.error("TMDB details parse error:", e); }
      }

      setResultDetails(details);
    } catch (err) { console.error("Failed to load details:", err); }
    finally { setLoadingDetails(false); }
  };

  const isInWatchlist = (result) => {
    if (!result) return false;
    const id = result.imdbID || result.id;
    return watchlist.some(w => (w.imdbID && w.imdbID === id) || w.title === result.title);
  };

  const getWatchlistItem = (result) => {
    if (!result) return null;
    const id = result.imdbID || result.id;
    return watchlist.find(w => (w.imdbID && w.imdbID === id) || w.title === result.title);
  };

  const handleAddToWatchlist = async () => {
    if (!resultDetails) return;
    setAddingToWatchlist(true);
    setWatchlistMsg("");
    const existing = getWatchlistItem(resultDetails);
    if (existing) {
      try {
        await fetch(`${API_BASE_URL}/api/watchlist/${existing._id}`, { method: "DELETE", headers: authHeaders() });
        setWatchlist(prev => prev.filter(w => w._id !== existing._id));
        setWatchlistMsg("Removed from watchlist");
      } catch { setWatchlistMsg("Failed to remove"); }
      setAddingToWatchlist(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          title: resultDetails.title, year: resultDetails.year,
          genre: resultDetails.genre || resultDetails.tmdbGenres || "",
          director: resultDetails.director || "",
          poster: resultDetails.poster || "",
          imdbID: resultDetails.imdbID || "",
          mediaType: resultDetails.mediaType || "movie",
          rating: resultDetails.imdbRating || ""
        })
      });
      const data = await res.json();
      if (res.ok) { setWatchlist(prev => [data, ...prev]); setWatchlistMsg("Added to watchlist ✓"); }
      else setWatchlistMsg(data.error || "Failed to add");
    } catch { setWatchlistMsg("Failed to add"); }
    setAddingToWatchlist(false);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput; setChatInput(""); await submitChatMessage(msg);
  };

  const submitChatMessage = async (messageText) => {
    setChatMessages(prev => [...prev, { role: "user", content: messageText }]);
    setChatLoading(true); setChatError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ message: messageText, context: [] }),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatError("The Oracle is currently unavailable. Please try again.");
    } finally { setChatLoading(false); }
  };

  const triggerGenreSearch = (genreName) => submitChatMessage(`Recommend some popular ${genreName} movies`);
  const quickChips = ["Best sci-fi movies?", "Recommend a thriller", "Top directors?", "Hidden gems?"];

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  const CarouselSection = ({ title, emoji, loading, items, onItemClick, showRank = false, showRating = true, extra }) => (
    <div className="fade-in-scroll">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <span style={{ color: "var(--primary)" }}>{emoji}</span> {title}
        </h2>
        {extra}
      </div>
      {loading ? (
        <div className="spinner"></div>
      ) : items.length > 0 ? (
        <div className="carousel-container">
          <div className="carousel-track">
            {items.map((item, idx) => (
              <div key={item._id || item.id || idx} className="carousel-card" onClick={() => onItemClick(item)}>
                <div className="carousel-poster">
                  {showRank && <div className="carousel-rank">#{idx + 1}</div>}
                  {item.poster ? <img src={item.poster} alt={item.title} /> : <div style={{ background: "var(--bg-surface)", width: "100%", height: "100%" }} />}
                </div>
                <div className="carousel-info">
                  <h4>{item.title}</h4>
                  <div className="carousel-meta">
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{item.year}</span>
                    {showRating && item.rating && <RatingBadge rating={item.rating} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Nothing here yet.</p>
      )}
    </div>
  );

  const inWatchlist = isInWatchlist(resultDetails);

  return (
    <div className="dashboard-layout">
      <div className="page-content dashboard-two-column">

        {/* Main Feed */}
        <div className="main-feed">
          {genres.length > 0 && (
            <div className="genres-row fade-in-scroll" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
              {genres.map(g => (
                <button key={g.id} className="pill" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }} onClick={() => triggerGenreSearch(g.name)}>
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="search-section search-container fade-in-scroll" style={{ marginTop: "0" }}>
            <div className="search-bar-container">
              <div className="search-wrapper">
                <SearchIcon />
                <input type="text" className="search-input" placeholder="Search movies or TV shows..." value={searchQuery} onChange={handleSearchChange} onFocus={() => { if (searchQuery) setShowSearchResults(true); }} />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results-overlay">
                    {searchResults.map((res, i) => (
                      <div key={i} className="result-card" onClick={() => handleResultClick(res)}>
                        {res.poster && res.poster !== "N/A" ? <img src={res.poster} alt={res.title} className="result-poster" /> : <div className="result-poster" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><FilmIcon size={24} /></div>}
                        <div className="result-info">
                          <h4>{res.title}</h4>
                          <p>{res.year} &bull; <span style={{ textTransform: "capitalize" }}>{res.mediaType}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="search-results-overlay">
                    <div className="no-results">No results for "{searchQuery}"</div>
                  </div>
                )}
              </div>
            </div>
            <div className="filter-pills">
              {["all", "movie", "series"].map(f => (
                <button key={f} className={`pill ${searchTypeFilter === f ? "active" : ""}`} onClick={() => handleFilterChange(f)}>
                  {f === "all" ? "All" : f === "movie" ? "Movies" : "TV Shows"}
                </button>
              ))}
            </div>
          </div>

          <CarouselSection title="Movies for You" emoji="✨" loading={loadingRecommended} items={recommended}
            onItemClick={item => handleResultClick({ ...item, mediaType: "movie" })} />

          <CarouselSection title="Your Watchlist" emoji="📌" loading={loadingWatchlist} items={watchlist}
            onItemClick={item => handleResultClick({ ...item, mediaType: item.mediaType || "movie" })} showRating={false} />

          <CarouselSection title="Your Rated Movies" emoji="⭐" loading={loadingFavorites} items={favorites}
            onItemClick={item => handleResultClick({ ...item, mediaType: "movie" })} />

          <CarouselSection
            title={`Best ${topRatedType === "movie" ? "Movies" : "Series"} of All Time`}
            emoji={topRatedType === "movie" ? "🏆" : "📺"}
            loading={loadingTopRated}
            items={topRated}
            onItemClick={item => handleResultClick({ ...item, mediaType: topRatedType })}
            showRank={true}
            extra={
              <div className="filter-pills" style={{ marginTop: 0 }}>
                <button className={`pill ${topRatedType === "movie" ? "active" : ""}`} onClick={() => setTopRatedType("movie")}>Movies</button>
                <button className={`pill ${topRatedType === "series" ? "active" : ""}`} onClick={() => setTopRatedType("series")}>TV Shows</button>
              </div>
            }
          />
        </div>

        {/* AI Sidebar */}
        <div className="ai-sidebar fade-in-scroll">
          <div className="ai-header" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <div className="ai-title">Oracle Assistant</div>
              <div className="ai-subtitle">Powered by Groq &middot; LLaMA-3</div>
            </div>
          </div>
          <div className="ai-messages" style={{ flex: 1, overflowY: "auto" }}>
            {chatMessages.map((msg, idx) =>
              msg.role === "assistant" ? (
                <div key={idx} className="ai-msg">
                  <div className="ai-msg-header"><span className="ai-msg-label" style={{ fontWeight: 700 }}>Oracle</span></div>
                  <div className="ai-msg-oracle">
                    {typeof msg.content === "object" ? (
                      <>
                        <div className="ai-chat-response">{msg.content.chat_response}</div>
                        {msg.content.recommendations?.length > 0 && (
                          <div className="ai-recommendations">
                            {msg.content.recommendations.map((rec, i) => (
                              <div key={i} className="ai-rec-card" onClick={() => handleResultClick(rec)}>
                                {rec.poster && <div className="ai-rec-poster"><img src={rec.poster} alt={rec.title} /></div>}
                                <div className="ai-rec-content">
                                  <div className="ai-rec-header">
                                    <span className="ai-rec-title">{rec.title}</span>
                                    {rec.year && <span className="ai-rec-year">({rec.year})</span>}
                                    {rec.mediaType && <MediaTypeBadge type={rec.mediaType} />}
                                  </div>
                                  {rec.genres?.length > 0 && <div className="ai-rec-genres">{rec.genres.join(", ")}</div>}
                                  <div className="ai-rec-justification">{rec.justification}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : <p>{msg.content}</p>}
                  </div>
                </div>
              ) : (
                <div key={idx} className="ai-msg ai-msg-user">
                  <div className="ai-msg-header" style={{ justifyContent: "flex-end" }}><span className="ai-msg-label">{user?.username}</span></div>
                  <div className="ai-msg-content">{msg.content}</div>
                </div>
              )
            )}
            {chatLoading && (
              <div className="ai-msg">
                <div className="ai-msg-header"><span className="ai-msg-label" style={{ fontWeight: 700 }}>Oracle</span></div>
                <div className="ai-msg-oracle" style={{ display: "flex", gap: "8px" }}>
                  <span className="spinner spinner-light" style={{ width: "16px", height: "16px" }}></span>
                  <span style={{ color: "var(--text-muted)" }}>Thinking...</span>
                </div>
              </div>
            )}
            {chatError && <div className="ai-msg"><div className="ai-msg-oracle" style={{ color: "var(--danger)", borderLeft: "2px solid var(--danger)" }}>{chatError}</div></div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "0 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)", zIndex: 10 }}>
            <div className="ai-chips" style={{ marginBottom: "8px", marginTop: "12px" }}>
              {quickChips.map((chip, idx) => (
                <button key={idx} className="ai-chip" onClick={() => { setChatInput(chip); }} disabled={chatLoading}>{chip}</button>
              ))}
            </div>
            <form className="ai-input-row" onSubmit={handleChatSubmit} style={{ paddingBottom: "16px" }}>
              <input placeholder="Ask for recommendations..." value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={chatLoading} />
              <button type="submit" className="btn-arcane" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <span className="spinner spinner-light"></span> : "✦ Ask"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      {selectedResult && (
        <div className="modal-backdrop" onClick={() => { setSelectedResult(null); setShowTrailer(false); }}>
          <div className="modal-content result-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "900px", width: "95vw" }}>
            <button className="modal-close" onClick={() => { setSelectedResult(null); setShowTrailer(false); }}><CloseIcon /></button>

            {loadingDetails ? (
              <div className="modal-loading"><span className="spinner spinner-gold"></span><p>Loading details...</p></div>
            ) : resultDetails ? (
              <div className="details-layout" style={{ flexDirection: "column", gap: "0" }}>
                
                {/* Trailer */}
                {showTrailer && resultDetails.tmdbTrailer && getYouTubeEmbedUrl(resultDetails.tmdbTrailer) ? (
                  <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", marginBottom: "0" }}>
                    <iframe
                      src={getYouTubeEmbedUrl(resultDetails.tmdbTrailer)}
                      title="Trailer"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                    <button onClick={() => setShowTrailer(false)} style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", zIndex: 5 }}>✕ Close Trailer</button>
                  </div>
                ) : (
                  /* Hero Banner area */
                  <div style={{ display: "flex", gap: "24px", padding: "24px 24px 0" }}>
                    {/* Poster */}
                    <div className="details-poster" style={{ flexShrink: 0, width: "160px" }}>
                      {resultDetails.poster ? (
                        <img src={resultDetails.poster} alt={resultDetails.title} style={{ width: "100%", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.6)" }} />
                      ) : (
                        <div className="poster-placeholder"><FilmIcon size={40} /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="details-info" style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "8px" }}>{resultDetails.title}</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {resultDetails.imdbRating && resultDetails.imdbRating !== "N/A" && (
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--primary)", color: "#000", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.95rem" }}>
                            <StarIcon /> {resultDetails.imdbRating}
                          </span>
                        )}
                        {resultDetails.year && <span style={{ color: "var(--text-secondary)" }}>{resultDetails.year}</span>}
                        {resultDetails.runtime && resultDetails.runtime !== "N/A" && <span style={{ color: "var(--text-secondary)" }}>{resultDetails.runtime}</span>}
                        <MediaTypeBadge type={resultDetails.mediaType} />
                      </div>

                      {/* Genre pills */}
                      {(resultDetails.genre || resultDetails.tmdbGenres) && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {(resultDetails.genre || resultDetails.tmdbGenres || "").split(",").map((g, i) => (
                            <span key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "2px 10px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{g.trim()}</span>
                          ))}
                        </div>
                      )}

                      {/* Plot */}
                      {resultDetails.plot && resultDetails.plot !== "N/A" && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "16px" }}>{resultDetails.plot}</p>
                      )}

                      {/* Director */}
                      {resultDetails.director && resultDetails.director !== "N/A" && (
                        <div style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
                          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Director: </span>
                          <span style={{ color: "var(--primary)", fontWeight: 600 }}>{resultDetails.director}</span>
                        </div>
                      )}

                      {/* Awards */}
                      {resultDetails.Awards && resultDetails.Awards !== "N/A" && (
                        <div style={{ color: "#F5C518", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                          🏆 {resultDetails.Awards}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                        {resultDetails.tmdbTrailer && (
                          <button
                            onClick={() => setShowTrailer(true)}
                            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--primary)", color: "#000", border: "none", borderRadius: "6px", padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
                          >
                            <PlayIcon /> Watch Trailer
                          </button>
                        )}
                        <button
                          onClick={handleAddToWatchlist}
                          disabled={addingToWatchlist}
                          style={{ display: "flex", alignItems: "center", gap: "8px", background: inWatchlist ? "var(--bg-card)" : "transparent", color: inWatchlist ? "var(--primary)" : "var(--text-secondary)", border: `1px solid ${inWatchlist ? "var(--primary)" : "var(--border-subtle)"}`, borderRadius: "6px", padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}
                        >
                          <BookmarkIcon filled={inWatchlist} /> {inWatchlist ? "In Watchlist" : "+ Watchlist"}
                        </button>
                      </div>
                      {watchlistMsg && <p style={{ marginTop: "8px", fontSize: "0.82rem", color: watchlistMsg.includes("✓") || watchlistMsg.includes("Added") ? "var(--success)" : "var(--danger)" }}>{watchlistMsg}</p>}
                    </div>
                  </div>
                )}

                {/* Cast */}
                {resultDetails.tmdbCast?.length > 0 && !showTrailer && (
                  <div style={{ padding: "20px 24px 0" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Top Cast</h4>
                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                      {resultDetails.tmdbCast.map((c, i) => (
                        <div key={i} style={{ width: "72px", flexShrink: 0, textAlign: "center" }}>
                          {c.profile ? <img src={c.profile} alt={c.name} style={{ width: "72px", height: "108px", objectFit: "cover", borderRadius: "6px", display: "block" }} /> : <div style={{ width: "72px", height: "108px", background: "var(--bg-card)", borderRadius: "6px" }} />}
                          <div style={{ fontSize: "0.72rem", marginTop: "5px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.character}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Movies */}
                {resultDetails.tmdbSimilar?.length > 0 && !showTrailer && (
                  <div style={{ padding: "20px 24px 24px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>More Like This</h4>
                    <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }}>
                      {resultDetails.tmdbSimilar.map((s, i) => (
                        <div key={i} onClick={() => handleResultClick({ ...s, mediaType: resultDetails.mediaType })} style={{ width: "80px", flexShrink: 0, cursor: "pointer" }}>
                          {s.poster ? <img src={s.poster} alt={s.title} style={{ width: "80px", height: "120px", objectFit: "cover", borderRadius: "6px", display: "block", transition: "opacity 0.2s" }} /> : <div style={{ width: "80px", height: "120px", background: "var(--bg-card)", borderRadius: "6px" }} />}
                          <div style={{ fontSize: "0.68rem", marginTop: "5px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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