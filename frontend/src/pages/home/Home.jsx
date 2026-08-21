import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const { isAuthenticated, isOrganizer } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventsAPI.getEvents();
        setEvents(res.data.events || res.data || []);
      } catch (err) {
        console.error('Failed to load events for home page', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const upcoming = events
    .filter((e) => new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const categoryCount = new Set(events.map((e) => e.category_name)).size;
  const thisMonthCount = upcoming.filter((e) => {
    const d = new Date(e.event_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const featured = upcoming.slice(0, 3);

  return (
    <div className="container">
      <section className="hero">
        <span className="hero-eyebrow">EventHive · Campus Events</span>
        <h1 className="hero-headline">Discover. Connect. Experience.</h1>
        <p className="hero-subtext">
          Every workshop, mixer, seminar, and game night on campus — in one place.
          Find what's happening, RSVP in seconds, and never miss another event.
        </p>
        <div className="hero-actions">
          <Link to="/events" className="btn btn-primary">Explore Events</Link>
          {isOrganizer ? (
            <Link to="/organizer/create" className="btn btn-secondary">Create Event</Link>
          ) : isAuthenticated ? (
            <Link to="/my-rsvps" className="btn btn-secondary">My RSVPs</Link>
          ) : (
            <Link to="/register" className="btn btn-secondary">Get Started</Link>
          )}
        </div>

        {!loading && (
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-number">{upcoming.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{categoryCount}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{thisMonthCount}</span>
              <span className="stat-label">Happening This Month</span>
            </div>
          </div>
        )}
      </section>

      <section className="featured-section">
        <div className="page-header">
          <h2>Coming Up</h2>
          <Link to="/events" className="nav-link">See all events →</Link>
        </div>

        {loading ? (
          <div className="loading">Loading events…</div>
        ) : featured.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming events yet — check back soon.</p>
          </div>
        ) : (
          <div className="event-grid">
            {featured.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="event-card-link">
                <div className="event-card">
                  {event.banner_image_url && (
                    <img src={event.banner_image_url} alt={event.title} className="event-banner" />
                  )}
                  <div className="event-content">
                    <span className="event-category">{event.category_name}</span>
                    <h3>{event.title}</h3>
                    <p className="event-date">
                      {new Date(event.event_date).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                    <p className="event-location">{event.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
