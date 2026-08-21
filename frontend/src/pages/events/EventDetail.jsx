import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, rsvpsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const eventRes = await eventsAPI.getEvent(id);
        setEvent(eventRes.data.event || eventRes.data);

        if (isAuthenticated) {
          try {
            const rsvpRes = await rsvpsAPI.getMyRSVPs();
            const mine = (rsvpRes.data.rsvps || []).find(
              (r) => String(r.event_id) === String(id)
            );
            setRsvpStatus(mine ? mine.status : null);
          } catch {
            setRsvpStatus(null);
          }
        }
      } catch (err) {
        console.error('Failed to load event', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated]);

  const handleRSVP = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await rsvpsAPI.createRSVP(id, { status: 'going' });
      setRsvpStatus('going');
      setMessage({ type: 'success', text: "You're registered for this event." });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not complete RSVP.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRSVP = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await rsvpsAPI.deleteRSVP(id);
      setRsvpStatus(null);
      setMessage({ type: 'success', text: 'RSVP cancelled.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not cancel RSVP.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading event…</div></div>;
  if (!event) return <div className="container"><div className="error-message">Event not found</div></div>;

  const eventDate = new Date(event.event_date);

  return (
    <div className="container">
      <div className="event-detail">
        {event.banner_image_url && (
          <img src={event.banner_image_url} alt={event.title} className="event-detail-banner" />
        )}

        <div className="event-detail-content">
          {event.category_name && (
            <span className="event-category">{event.category_name}</span>
          )}
          <h1>{event.title}</h1>

          <div className="event-meta">
            <div className="meta-item">
              <strong>Date &amp; Time</strong>
              <span>
                {eventDate.toLocaleDateString(undefined, {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
                {' · '}
                {eventDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
            <div className="meta-item">
              <strong>Location</strong>
              <span>{event.location}</span>
            </div>
            {event.organizer_name && (
              <div className="meta-item">
                <strong>Organizer</strong>
                <span>{event.organizer_name}</span>
              </div>
            )}
            {event.capacity ? (
              <div className="meta-item">
                <strong>Capacity</strong>
                <span>{event.capacity} attendees</span>
              </div>
            ) : null}
          </div>

          <div className="event-description">
            <h3>About this event</h3>
            <p>{event.description}</p>
          </div>

          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="rsvp-actions">
            {isAuthenticated ? (
              rsvpStatus ? (
                <div className="rsvp-active">
                  <span className="rsvp-badge">✓ You're going</span>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelRSVP}
                    disabled={submitting}
                  >
                    {submitting ? 'Cancelling…' : 'Cancel RSVP'}
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleRSVP}
                  disabled={submitting}
                >
                  {submitting ? 'Registering…' : 'RSVP to this Event'}
                </button>
              )
            ) : (
              <div className="rsvp-prompt">
                <Link to="/login">Log in</Link> to RSVP for this event.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
