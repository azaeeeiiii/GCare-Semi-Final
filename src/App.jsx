import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import News from './pages/News';
import Feed from './pages/Feed';
import Report from './pages/Report';
import Admin from './pages/Admin';
import RequireAuth from './components/RequireAuth';
import Legal from './pages/Legal';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';

/* Scroll to #section after in-app navigation (e.g. /news#alerts) and to top on new pages */
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
        <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/news" element={<News />} />
        <Route path="/terms" element={<Legal which="terms" />} />
        <Route path="/privacy" element={<Legal which="privacy" />} />
        <Route path="*" element={<ComingSoon />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
