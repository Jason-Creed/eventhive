import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const EventList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchEvents(); }, [categories, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categories) params.category = categories;
      if (search) params.search = search;
      const res = await eventsAPI.getEvents(params);
      setEvents(res.data.events);
      setError('');
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading events...</div></div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Discover Events</h1>
      </div>
      <div className="event-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-content">
              <span className="event-category">{event.category_name}</span>
              <h3>{event.title}</h3>
              <p>{new Date(event.event_date).toLocaleDateString()}</p>
              <Link to={`/events/${event.id}`} className="btn btn-primary">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
