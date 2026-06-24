import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

/* ═══════════════════════════════════════
   SVG ICONS (no emojis)
   ═══════════════════════════════════════ */

function FilmIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="url(#gGold)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="url(#gGold)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="5" r="1.2" fill="#c9a84c" />
      <circle cx="12" cy="19" r="1.2" fill="#c9a84c" />
      <circle cx="5" cy="12" r="1.2" fill="#c9a84c" />
      <circle cx="19" cy="12" r="1.2" fill="#c9a84c" />
      <circle cx="7.05" cy="7.05" r="1" fill="#a07830" />
      <circle cx="16.95" cy="7.05" r="1" fill="#a07830" />
      <circle cx="7.05" cy="16.95" r="1" fill="#a07830" />
      <circle cx="16.95" cy="16.95" r="1" fill="#a07830" />
      <defs>
        <linearGradient id="gGold" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#f0d070" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MaskIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M2 12C2 12 5 6 12 6s10 6 10 6-3 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" />
      <circle cx="15" cy="11" r="1.5" fill="currentColor" />
      <path d="M8 15c1 1 3 1.5 4 1.5s3-.5 4-1.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function DirectorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="15" rx="2" />
      <path d="M2 12h20" />
      <path d="M12 7v15" />
      <path d="M2 7l3-5h14l3 5" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function StarIcon({ filled = true }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#c9a84c" : "none"} stroke="#c9a84c" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h12a4 4 0 0 1 4 4v12" strokeLinecap="round" />
      <path d="M4 4v14a2 2 0 0 0 2 2h14" strokeLinecap="round" />
      <line x1="8" y1="9" x2="14" y2="9" />
      <line x1="8" y1="13" x2="12" y2="13" />
    </svg>
  );
}

function QuillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 2L8 14v4h4L24 6" transform="translate(-2, 0)" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
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

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// IMDB-style star rating display
function StarRating({ rating }) {
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span className="star-rating" style={{ display: "inline-flex", gap: "1px", alignItems: "center" }}>
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} filled={true} />
      ))}
      {halfStar && <StarIcon key="half" filled={false} />}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} filled={false} />
      ))}
    </span>
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

  // Data states
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  
  // Loading states
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Manual Add states
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editRating, setEditRating] = useState("");

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Greetings, cinephile. I am your Arcane Advisor \u2014 ask me anything about your collection, or seek recommendations from the vast realm of cinema, series, and anime.",
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

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    loadMovies();
    loadWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    
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
        const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(q)}`, {
          headers: authHeaders(),
        });
        
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

  // ── WATCHLIST LOGIC ──
  const loadWatchlist = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
        headers: authHeaders(),
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setWatchlist(data);
    } catch (err) {
      console.error("Failed to load watchlist:", err);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const addToWatchlist = async (item) => {
    // Check if already in watchlist
    if (watchlist.some(w => w.imdbID === item.imdbID && item.imdbID)) {
      return; // Already added
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: item.title,
          year: item.year,
          mediaType: item.mediaType,
          poster: item.poster,
          imdbID: item.imdbID
        }),
      });

      if (res.status === 401) return logout();
      if (!res.ok) throw new Error("Failed to add to watchlist");

      const newItem = await res.json();
      setWatchlist([newItem, ...watchlist]);
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) return logout();
      
      setWatchlist(watchlist.filter(w => w._id !== id));
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    }
  };

  const moveToCodex = async (item) => {
    try {
      // 1. Add to Codex
      const res = await fetch(`${API_BASE_URL}/api/movies`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: item.title,
          year: item.year ? Number(item.year.substring(0, 4)) : null, // handle "2020-2023" formats
          director: item.director || "",
          genre: item.genre || item.mediaType || "",
          rating: 0,
        }),
      });

      if (res.status === 401) return logout();
      const newMovie = await res.json();
      setMovies([newMovie, ...movies]);

      // 2. Remove from Watchlist
      await removeFromWatchlist(item._id);
    } catch (err) {
      console.error("Failed to move to codex:", err);
    }
  };

  // ── READ ──
  const loadMovies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/movies`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Failed to load movies:", err);
    } finally {
      setLoadingMovies(false);
    }
  };

  // ── CREATE ──
  const addMovie = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setAdding(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/movies`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          genre: genre.trim(),
          director: director.trim(),
          year: year ? Number(year) : null,
          rating: rating ? Number(rating) : 0,
        }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const newMovie = await res.json();

      setMovies([newMovie, ...movies]);
      setTitle("");
      setGenre("");
      setDirector("");
      setYear("");
      setRating("");
    } catch (err) {
      console.error("Failed to add movie:", err);
    } finally {
      setAdding(false);
    }
  };

  // ── UPDATE ──
  const startEdit = (movie) => {
    setEditingId(movie._id);
    setEditTitle(movie.title);
    setEditGenre(movie.genre || "");
    setEditDirector(movie.director || "");
    setEditYear(movie.year || "");
    setEditRating(movie.rating || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditGenre("");
    setEditDirector("");
    setEditYear("");
    setEditRating("");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/movies/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: editTitle.trim(),
          genre: editGenre.trim(),
          director: editDirector.trim(),
          year: editYear ? Number(editYear) : null,
          rating: editRating ? Number(editRating) : 0,
        }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const updatedMovie = await res.json();

      setMovies(movies.map((m) => (m._id === id ? updatedMovie : m)));

      cancelEdit();
    } catch (err) {
      console.error("Failed to update movie:", err);
    }
  };

  // ── DELETE ──
  const deleteMovie = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/movies/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      setMovies(movies.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Failed to delete movie:", err);
    }
  };

  // ── AI CHAT ──
  const sendChat = async (message) => {
    if (!message || !message.trim()) return;

    const userMessage = message.trim();
    setChatInput("");
    setChatError("");

    // Add user message to chat
    const updatedMessages = [
      ...chatMessages,
      { role: "user", content: userMessage },
    ];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      // Build conversation history (exclude the initial greeting)
      const conversationHistory = updatedMessages
        .slice(1) // skip initial greeting
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          message: userMessage,
          movies: movies.map((m) => ({
            title: m.title,
            genre: m.genre,
            director: m.director,
            year: m.year,
            rating: m.rating,
          })),
          watchlist: watchlist.map(w => ({
            title: w.title,
            year: w.year,
            mediaType: w.mediaType
          })),
          conversationHistory,
        }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setChatError(data.error || "The oracle could not be reached.");
        setChatLoading(false);
        return;
      }

      setChatMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatError(
        "Cannot reach the Arcane Advisor. Ensure the server is running."
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChat(chatInput);
  };

  const handleChipClick = (text) => {
    sendChat(text);
  };

  // ── LOGOUT ──
  const logout = () => {
    localStorage.removeItem("moviematch_user");
    localStorage.removeItem("moviematch_token");
    navigate("/");
  };

  // Quick-action chips
  const quickChips = [
    "What should I watch next?",
    "Recommend a good anime",
    "Any hidden gems I might like?",
    "Rate my taste in films",
  ];

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="logo">
          <span className="logo-icon">
            <FilmIcon size={26} />
          </span>
          <span className="logo-text">Movie Match</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="username">{user?.username || "User"}</span>
          <button className="btn-ghost btn-sm" onClick={logout}>
            Depart
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dashboard-body">
        
        {/* ── Search Bar ── */}
        <div className="search-container">
          <div className="search-input-wrap">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search the OMDB archives for movies, series, or anime..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if(searchQuery.trim()) setShowSearchResults(true); }}
            />
          </div>
          
          {showSearchResults && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">
                  <span className="spinner spinner-gold"></span>
                  <span>Scrying...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map((result) => {
                    const isAdded = watchlist.some(w => w.imdbID === result.imdbID);
                    return (
                      <div key={result.imdbID} className="search-result-item">
                        <div className="search-result-poster">
                          {result.poster ? (
                            <img src={result.poster} alt={result.title} />
                          ) : (
                            <div className="poster-placeholder"><FilmIcon size={16}/></div>
                          )}
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-title">{result.title}</div>
                          <div className="search-result-meta">
                            {result.year && <span>{result.year}</span>}
                            <MediaTypeBadge type={result.mediaType} />
                          </div>
                        </div>
                        <button 
                          className={`btn-ghost btn-sm ${isAdded ? 'added' : ''}`}
                          onClick={() => addToWatchlist(result)}
                          disabled={isAdded}
                        >
                          {isAdded ? <CheckIcon /> : <PlusIcon />}
                          {isAdded ? "Added" : "Watchlist"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery.trim() ? (
                <div className="search-loading">No visions found for "{searchQuery}"</div>
              ) : null}
            </div>
          )}
        </div>

        {/* ── Watchlist ── */}
        <div className="card">
          <div className="section-title">
            <EyeIcon /> The Watchlist
            <span className="count-badge">
              {watchlist.length} {watchlist.length === 1 ? "vision" : "visions"}
            </span>
          </div>
          
          {loadingWatchlist ? (
            <div className="empty-state">
              <div className="spinner spinner-light" style={{ margin: "0 auto" }}></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="empty-state">
              <p>Your watchlist is empty.</p>
              <p className="hint">Search the archives above to add titles you wish to see.</p>
            </div>
          ) : (
            <div className="watchlist-grid">
              {watchlist.map(item => (
                <div key={item._id} className="watchlist-item">
                  <div className="watchlist-poster">
                    {item.poster ? (
                      <img src={item.poster} alt={item.title} />
                    ) : (
                      <div className="poster-placeholder"><FilmIcon size={24}/></div>
                    )}
                  </div>
                  <div className="watchlist-info">
                    <div className="watchlist-title" title={item.title}>{item.title}</div>
                    <div className="watchlist-meta">
                      {item.year && <span>{item.year}</span>}
                      <MediaTypeBadge type={item.mediaType} />
                    </div>
                  </div>
                  <div className="watchlist-overlay">
                    <button className="btn-gold btn-sm" onClick={() => moveToCodex(item)}>
                      <CheckIcon /> Watched
                    </button>
                    <button className="btn-remove btn-sm" onClick={() => removeFromWatchlist(item._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Add Movie Form (Manual) ── */}
        <div className="card">
          <div className="section-title">
            <QuillIcon /> Add to the Codex Manually
          </div>
          <form className="add-movie-form" onSubmit={addMovie}>
            <div className="form-row-top">
              <input
                id="add-title"
                placeholder="Film title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                id="add-director"
                placeholder="Director..."
                value={director}
                onChange={(e) => setDirector(e.target.value)}
              />
            </div>
            <div className="form-row-bottom">
              <input
                id="add-genre"
                placeholder="Genre..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
              <input
                id="add-year"
                className="input-sm"
                type="number"
                min="1888"
                max="2100"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <input
                id="add-rating"
                className="input-sm"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0-10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
              <button
                type="submit"
                className="btn-gold"
                disabled={adding || !title.trim()}
              >
                {adding ? (
                  <span className="spinner"></span>
                ) : (
                  "\u2726 Inscribe"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Movie List (Codex) ── */}
        <div className="card">
          <div className="section-title">
            <ScrollIcon /> The Codex of Films
            <span className="count-badge">
              {movies.length} {movies.length === 1 ? "tome" : "tomes"}
            </span>
          </div>

          {loadingMovies ? (
            <div className="empty-state">
              <div
                className="spinner spinner-light"
                style={{ margin: "0 auto" }}
              ></div>
              <p style={{ marginTop: "16px" }}>Summoning your collection...</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ScrollIcon />
              </div>
              <p>The codex is empty</p>
              <p className="hint">
                Inscribe your first film above to begin the chronicle.
              </p>
            </div>
          ) : (
            <div className="movies-grid">
              {movies.map((movie, idx) => (
                <div
                  key={movie._id}
                  className={`movie-card ${
                    editingId === movie._id ? "editing" : ""
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {editingId === movie._id ? (
                    /* ── Edit Mode ── */
                    <>
                      <div className="edit-form">
                        <input
                          id={`edit-title-${movie._id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                          style={{ flex: 2 }}
                        />
                        <input
                          id={`edit-director-${movie._id}`}
                          value={editDirector}
                          onChange={(e) => setEditDirector(e.target.value)}
                          placeholder="Director"
                          style={{ flex: 1 }}
                        />
                        <input
                          id={`edit-genre-${movie._id}`}
                          value={editGenre}
                          onChange={(e) => setEditGenre(e.target.value)}
                          placeholder="Genre"
                          style={{ flex: 1 }}
                        />
                        <input
                          id={`edit-year-${movie._id}`}
                          type="number"
                          min="1888"
                          max="2100"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          placeholder="Year"
                          style={{ width: "75px", flex: "none" }}
                        />
                        <input
                          id={`edit-rating-${movie._id}`}
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={editRating}
                          onChange={(e) => setEditRating(e.target.value)}
                          placeholder="Rating"
                          style={{ width: "70px", flex: "none" }}
                        />
                      </div>
                      <div className="movie-actions">
                        <button
                          className="btn-save"
                          onClick={() => saveEdit(movie._id)}
                        >
                          Save
                        </button>
                        <button className="btn-ghost btn-sm" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    /* ── Display Mode ── */
                    <>
                      <div className="movie-info">
                        <div className="movie-title-row">
                          <h3>{movie.title}</h3>
                          {movie.year && (
                            <span className="movie-year">({movie.year})</span>
                          )}
                        </div>
                        <div className="movie-meta">
                          {movie.director && (
                            <span className="director-tag">
                              <DirectorIcon /> {movie.director}
                            </span>
                          )}
                          {movie.genre && (
                            <span className="genre-tag">
                              <MaskIcon /> {movie.genre}
                            </span>
                          )}
                        </div>
                        <div className="movie-rating-row">
                          <StarRating rating={movie.rating || 0} />
                          <RatingBadge rating={movie.rating || 0} />
                        </div>
                      </div>
                      <div className="movie-actions">
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(movie)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => deleteMovie(movie._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Arcane Advisor (AI Chat) ── */}
        <div className="card ai-card">
          <div className="ai-header">
            <div className="wizard-avatar-wrap">
              <img
                src="/wizard.png"
                alt="The Arcane Advisor"
                className="wizard-avatar"
              />
            </div>
            <div>
              <div className="ai-title">The Arcane Advisor</div>
              <div className="ai-subtitle">
                Powered by Groq &middot; GPT-OSS
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="ai-messages">
            {chatMessages.map((msg, idx) =>
              msg.role === "assistant" ? (
                <div key={idx} className="ai-msg">
                  <div className="ai-msg-header">
                    <img
                      src="/wizard.png"
                      alt=""
                      className="ai-msg-avatar"
                    />
                    <span className="ai-msg-label">The Arcane Advisor</span>
                  </div>
                  <div className="ai-msg-oracle">{msg.content}</div>
                </div>
              ) : (
                <div key={idx} className="ai-msg ai-msg-user">
                  <div className="ai-msg-label" style={{ textAlign: "right" }}>You</div>
                  <div className="ai-msg-user-text">{msg.content}</div>
                </div>
              )
            )}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="ai-typing">
                <img
                  src="/wizard.png"
                  alt=""
                  className="ai-msg-avatar"
                  style={{ opacity: 0.7 }}
                />
                <div className="ai-typing-dots">
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Error */}
          {chatError && <div className="ai-error">{chatError}</div>}

          {/* Quick Action Chips */}
          <div className="ai-chips">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                className="ai-chip"
                onClick={() => handleChipClick(chip)}
                disabled={chatLoading}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="ai-input-row" onSubmit={handleChatSubmit}>
            <input
              id="ai-chat-input"
              placeholder="Ask the oracle anything about your collection..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button
              type="submit"
              className="btn-arcane"
              disabled={chatLoading || !chatInput.trim()}
            >
              {chatLoading ? (
                <span className="spinner spinner-light"></span>
              ) : (
                "\u2726 Consult"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}