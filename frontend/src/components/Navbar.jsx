import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="nav-back"
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <Link to="/" className="navbar-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#FFB100" />
            </svg>
            EventHive
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/events" className="nav-link">Events</Link>
          {isAuthenticated ? (
            <>
              {isOrganizer && <Link to="/organizer/my-events" className="nav-link">My Events</Link>}
              {isOrganizer && <Link to="/organizer/create" className="nav-link">Create Event</Link>}
              {isAdmin && <Link to="/admin/users" className="nav-link">Users</Link>}
              <Link to="/my-rsvps" className="nav-link">My RSVPs</Link>
              <span className="nav-user">{user?.name} ({user?.role})</span>
              <button onClick={handleLogout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
