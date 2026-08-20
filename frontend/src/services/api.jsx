import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateEvent: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getMyEvents: () => api.get('/events/my-events')
};

export const rsvpsAPI = {
  createRSVP: (eventId, data) => api.post(`/events/${eventId}/rsvp`, data),
  deleteRSVP: (eventId) => api.delete(`/events/${eventId}/rsvp`),
  getEventRSVPs: (eventId) => api.get(`/events/${eventId}/rsvps`),
  getMyRSVPs: () => api.get('/events/my-rsvps')
};

export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  updateUserStatus: (id, data) => api.put(`/users/${id}/status`, data)
};

export default api;
