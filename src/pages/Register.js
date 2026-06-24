import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

// SVG Film Reel Icon
function FilmIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="url(#goldGradR)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="url(#goldGradR)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="5" r="1.2" fill="#c9a84c" />
      <circle cx="12" cy="19" r="1.2" fill="#c9a84c" />
      <circle cx="5" cy="12" r="1.2" fill="#c9a84c" />
      <circle cx="19" cy="12" r="1.2" fill="#c9a84c" />
      <circle cx="7.05" cy="7.05" r="1" fill="#a07830" />
      <circle cx="16.95" cy="7.05" r="1" fill="#a07830" />
      <circle cx="7.05" cy="16.95" r="1" fill="#a07830" />
      <circle cx="16.95" cy="16.95" r="1" fill="#a07830" />
      <defs>
        <linearGradient id="goldGradR" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#f0d070" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("All fields must be filled to proceed.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not align.");
      return;
    }

    if (password.length < 4) {
      setError("Your key must be at least 4 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The ritual has failed.");
        setLoading(false);
        return;
      }

      setSuccess("Your sigil has been forged. Redirecting to the gates...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Cannot reach the server. Is the backend awakened?");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-icon">
          <FilmIcon size={42} />
        </div>
        <h1 className="logo">Movie Match</h1>
        <p className="subtitle">Forge your sigil to begin the chronicle</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="register-username">Choose Your Name</label>
            <input
              id="register-username"
              type="text"
              placeholder="A name for the records..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Secret Key</label>
            <input
              id="register-password"
              type="password"
              placeholder="Forge a key..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Key</label>
            <input
              id="register-confirm"
              type="password"
              placeholder="Repeat your key..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-gold" disabled={loading}>
            {loading ? <span className="spinner"></span> : "\u2726  Forge Your Sigil"}
          </button>
        </form>

        <p className="auth-footer">
          Already inscribed?{" "}
          <Link to="/">Enter the vault</Link>
        </p>
      </div>
    </div>
  );
}