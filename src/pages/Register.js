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
      setError("The passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Your password must be at least 4 characters long.");
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
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Cannot reach the server. Is the backend running?");
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
        <p className="subtitle">Create an account to track your movies</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              placeholder="Your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              placeholder="Repeat your password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-gold" disabled={loading}>
            {loading ? <span className="spinner"></span> : "\u2726  Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}