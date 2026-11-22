import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import News from './pages/News';
import Feed from './pages/Feed';
import Report from './pages/Report';
import Reports from './pages/Reports';
import Volunteer from './pages/Volunteer';
import Admin from './pages/Admin';
import ChatWidget from './components/ChatWidget';
import AdminVolunteers from './pages/AdminVolunteers';
import AdminAlerts from './pages/AdminAlerts';
import AdminEvents from './pages/AdminEvents';
import AdminNews from './pages/AdminNews';
import RequireAuth from './components/RequireAuth';
import Legal from './pages/Legal';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 0);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
        <Route path="/admin/volunteers" element={<RequireAuth admin><AdminVolunteers /></RequireAuth>} />
        <Route path="/admin/alerts" element={<RequireAuth admin><AdminAlerts /></RequireAuth>} />
        <Route path="/admin/events" element={<RequireAuth admin><AdminEvents /></RequireAuth>} />
        <Route path="/admin/news" element={<RequireAuth admin><AdminNews /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/news" element={<News />} />
        <Route path="/terms" element={<Legal which="terms" />} />
        <Route path="/privacy" element={<Legal which="privacy" />} />
        <Route path="*" element={<ComingSoon />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <ChatWidget />
    </>
  );
}