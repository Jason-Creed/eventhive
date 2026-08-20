import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', category_id: '', location: '', event_date: '', capacity: '' });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await eventsAPI.getEvents();
    const cats = [...new Set(res.data.events.map(e => e.category_name))];
    setFormData(f => ({ ...f, categories: cats.map((name, idx) => ({ id: idx + 1, name })) }));
  };

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
      Object.entries(formData).forEach(([key, value]) => { if (key !== 'categories' && value) data.append(key, value); });
      if (bannerFile) data.append('banner_image', bannerFile);
      await eventsAPI.createEvent(data);
      navigate('/organizer/my-events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1>Create New Event</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Event Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {formData.categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date & Time</label>
              <input type="datetime-local" name="event_date" value={formData.event_date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Banner Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {bannerPreview && <div className="image-preview"><img src={bannerPreview} alt="Preview" /></div>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
