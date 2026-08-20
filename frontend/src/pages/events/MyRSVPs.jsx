import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rsvpsAPI } from '@/services/api';

const MyRSVPs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    rsvpsAPI.getMyRSVPs().then(res => { setRsvps(res.data.rsvps); setLoading(false); }).catch(() => setError('Failed to load'));
  }, []);

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

  return (
    <div className="container">
      <h1>My RSVPs</h1>
      {error && <div className="error-message">{error}</div>}
      {rsvps.length === 0 ? <p>No RSVPs yet.</p> : rsvps.map(rsvp => (
        <div key={rsvp.id} className="rsvp-card">
          <div>
            <span className={`rsvp-status rsvp-${rsvp.status}`}>{rsvp.status}</span>
            <h3>{rsvp.event_title}</h3>
            <p>{new Date(rsvp.event_date).toLocaleDateString()}</p>
          </div>
          <Link to={`/events/${rsvp.event_id}`} className="btn btn-secondary">View</Link>
        </div>
      ))}
    </div>
  );
};

export default MyRSVPs;
