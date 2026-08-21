import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Home from '@/pages/home/Home';
import EventList from '@/pages/events/EventList';
import EventDetail from '@/pages/events/EventDetail';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import CreateEvent from '@/pages/organizer/CreateEvent';
import MyEvents from '@/pages/organizer/MyEvents';
import MyRSVPs from '@/pages/events/MyRSVPs';
import AdminUsers from '@/pages/admin/Users';
import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/organizer/my-events" element={<MyEvents />} />
              <Route path="/organizer/create" element={<CreateEvent />} />
              <Route path="/my-rsvps" element={<MyRSVPs />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
