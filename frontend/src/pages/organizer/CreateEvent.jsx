import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '', location: '', event_date: '', capacity: ''
  });
  const [categories, setCategories] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await eventsAPI.getEvents();
        const events = res.data.events || res.data || [];
        const seen = new Map();
        events.forEach((ev) => {
          if (ev.category_id && ev.category_name && !seen.has(ev.category_id)) {
            seen.set(ev.category_id, ev.category_name);
          }
        });
        setCategories([...seen.entries()].map(([id, name]) => ({ id, name })));
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (bannerFile) data.append('banner_image', bannerFile);
      await eventsAPI.createEvent(data);
      navigate('/organizer/my-events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="container">
      <div className="form-card">
        <h1>Create New Event</h1>
        <p className="auth-subtitle">Fill in the details below to publish a new campus event.</p>

        {error && <div className="error-message">{error}</div>}

        {categories.length === 0 && (
          <div className="message error" style={{ marginBottom: '1rem' }}>
            No categories found yet — create at least one event via the backend seed data first,
            or ask your Backend Developer to add a categories endpoint.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Event Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Fall Career Fair"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's this event about? Who should come?"
              required
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date &amp; Time</label>
              <input
                type="datetime-local"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                min={minDateTime}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Student Union Ballroom"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacity (optional)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Banner Image (optional)</label>
            <div className="upload-zone">
              <input type="file" accept="image/*" onChange={handleFileChange} id="banner-upload" className="file-input-hidden" />
              <label htmlFor="banner-upload" className="upload-label">
                {bannerFile ? bannerFile.name : 'Choose an image or drag one here'}
              </label>
            </div>
            {bannerPreview && (
              <div className="image-preview">
                <img src={bannerPreview} alt="Banner preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
