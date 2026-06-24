import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

export default function Dashboard() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editRating, setEditRating] = useState("");

  // Get logged-in user and token
  const user = JSON.parse(localStorage.getItem("moviematch_user") || "null");
  const token = localStorage.getItem("moviematch_token");

  // Helper: create auth headers for API requests
  const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── READ ──
  const loadMovies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/movies`, {
        headers: authHeaders()
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
      setLoading(false);
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
          rating: rating ? Number(rating) : 0
        })
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const newMovie = await res.json();

      setMovies([newMovie, ...movies]);
      setTitle("");
      setGenre("");
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
    setEditRating(movie.rating || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditGenre("");
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
          rating: editRating ? Number(editRating) : 0
        })
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const updatedMovie = await res.json();

      setMovies(
        movies.map((m) => (m._id === id ? updatedMovie : m))
      );

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
        headers: authHeaders()
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

  // ── LOGOUT ──
  const logout = () => {
    localStorage.removeItem("moviematch_user");
    localStorage.removeItem("moviematch_token");
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="logo">🎬 Movie Match</div>
        <div className="user-info">
          <div className="user-badge">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <span>{user?.username || "User"}</span>
          </div>
          <button className="btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dashboard-body">
        {/* ── Add Movie Form ── */}
        <div className="add-movie-card">
          <h2>➕ Add a Movie</h2>
          <form className="add-movie-form" onSubmit={addMovie}>
            <div>
              <input
                id="add-title"
                placeholder="Movie title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <input
                id="add-genre"
                placeholder="Genre (e.g. Sci-Fi)"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div>
              <input
                id="add-rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0–10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={adding || !title.trim()}
            >
              {adding ? <span className="spinner"></span> : "Add"}
            </button>
          </form>
        </div>

        {/* ── Movie List ── */}
        <div className="movies-section">
          <h2>
            🎥 Your Movies
            <span className="movie-count">{movies.length}</span>
          </h2>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: "0 auto" }}></div>
              <p style={{ marginTop: "16px" }}>Loading movies...</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍿</div>
              <p>No movies yet</p>
              <p className="hint">Add your first movie above to get started!</p>
            </div>
          ) : (
            <div className="movies-grid">
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  className={`movie-card ${editingId === movie._id ? "editing" : ""}`}
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
                          id={`edit-genre-${movie._id}`}
                          value={editGenre}
                          onChange={(e) => setEditGenre(e.target.value)}
                          placeholder="Genre"
                          style={{ flex: 1 }}
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
                          style={{ width: "80px", flex: "none" }}
                        />
                      </div>
                      <div className="movie-actions">
                        <button
                          className="btn-success btn-sm"
                          onClick={() => saveEdit(movie._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    /* ── Display Mode ── */
                    <>
                      <div className="movie-info">
                        <h3>{movie.title}</h3>
                        <div className="movie-meta">
                          {movie.genre && (
                            <span>🎭 {movie.genre}</span>
                          )}
                          <span>⭐ {movie.rating || 0}/10</span>
                        </div>
                      </div>
                      <div className="movie-actions">
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => startEdit(movie)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => deleteMovie(movie._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}