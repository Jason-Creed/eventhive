import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '@/services/api';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsAPI.getMyEvents().then(res => { setEvents(res.data.events); setLoading(false); }).catch(() => setError('Failed'));
  }, []);

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Events</h1>
        <Link to="/organizer/create" className="btn btn-primary">Create New Event</Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events yet.</p>
          <Link to="/organizer/create" className="btn btn-primary">Create Event</Link>
        </div>
      ) : (
        <div className="event-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-content">
                <span className="event-category">{event.category_name}</span>
                <h3>{event.title}</h3>
                <p>{new Date(event.event_date).toLocaleDateString()}</p>
                <div className="rsvp-counts">
                  <span>Going: {event.going_count || 0}</span>
                  <span>Interested: {event.interested_count || 0}</span>
                </div>
                <Link to={`/events/${event.id}`} className="btn btn-secondary">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
