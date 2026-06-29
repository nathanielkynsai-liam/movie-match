import { Link, useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("moviematch_user") || "null");

  const logout = () => {
    localStorage.removeItem("moviematch_token");
    localStorage.removeItem("moviematch_user");
    navigate("/");
  };

  if (!user || location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="top-nav">
      <div className="nav-content">
        <div className="nav-left">
          <div className="nav-links" style={{display: 'flex', gap: '16px'}}>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/discover/box-office" className={`nav-link ${location.pathname === '/discover/box-office' ? 'active' : ''}`}>Box Office</Link>
            <Link to="/discover/trending" className={`nav-link ${location.pathname === '/discover/trending' ? 'active' : ''}`}>Trending</Link>
            <Link to="/discover/people" className={`nav-link ${location.pathname === '/discover/people' ? 'active' : ''}`}>People</Link>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user.username}</span>
          </div>
          <button className="btn-ghost btn-sm" onClick={logout}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
