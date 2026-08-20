import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, rsvpsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.getEvent(id).then(res => { setEvent(res.data.event); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
  if (!event) return <div className="container"><div className="error-message">Event not found</div></div>;

  return (
    <div className="container">
      <div className="event-detail">
        <h1>{event.title}</h1>
        <p>{event.description}</p>
        <p>{new Date(event.event_date).toLocaleString()}</p>
        <p>{event.location}</p>
      </div>
    </div>
  );
};

export default EventDetail;
