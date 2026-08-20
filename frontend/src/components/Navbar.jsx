import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">EventHive</Link>
        <div className="navbar-links">
          <Link to="/events" className="nav-link">Events</Link>
          {isAuthenticated ? (
            <>
              {isOrganizer && <Link to="/organizer/my-events" className="nav-link">My Events</Link>}
              {isOrganizer && <Link to="/organizer/create" className="nav-link">Create Event</Link>}
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
