import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';
import '../styles/admin-more.css';

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'feed-nav__icon' };

const img = (file) => <img src={`/images/${file}`} alt="" aria-hidden="true" className="feed-nav__icon feed-nav__icon--img" />;

const NAV = [
  { to: '/feed', label: 'Feed', icon: img('feed_icon.png') },
  { to: '/report', label: 'Report', icon: img('report_icon.png') },
  { to: '/volunteer', label: 'Volunteer', icon: img('volunteer_icon.png') },
  { to: '/profile', label: 'Profile', icon: img('profile_icon.png') },
];

const ADMIN_MAIN = [
  { to: '/admin', label: 'Reports', icon: <svg {...svg}><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" /></svg> },
  { to: '/admin/contact', label: 'Messages', icon: <svg {...svg}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg> },
  { to: '/admin/verifications', label: 'ID', icon: <svg {...svg}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h4M14 14h3" /></svg> },
];

const ADMIN_MORE = [
  { to: '/admin/volunteers', label: 'Volunteers', icon: img('volunteer_icon.png') },
  { to: '/admin/alerts', label: 'Alerts', icon: <svg {...svg}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" /></svg> },
  { to: '/admin/events', label: 'Events', icon: <svg {...svg}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg> },
  { to: '/admin/news', label: 'News', icon: <svg {...svg}><path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h6M8 13h6" /></svg> },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const user = useUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdminView = user?.isAdmin && pathname.startsWith('/admin');

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMoreOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  if (!isAdminView) {
    return (
      <nav className="feed-nav" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="feed-nav__item" aria-current={pathname === n.to ? 'page' : undefined}>
            {n.icon}
            {n.label}
          </Link>
        ))}
      </nav>
    );
  }

  const moreActive = ADMIN_MORE.some((m) => pathname === m.to);

  return (
    <nav className="feed-nav" aria-label="Main">
      {ADMIN_MAIN.map((n) => (
        <Link key={n.to} to={n.to} className="feed-nav__item" aria-current={pathname === n.to ? 'page' : undefined}>
          {n.icon}
          {n.label}
        </Link>
      ))}

      <button
        type="button"
        className={`feed-nav__item ${moreActive || moreOpen ? 'feed-nav__item--on' : ''}`.trim()}
        aria-expanded={moreOpen}
        aria-haspopup="true"
        onClick={() => setMoreOpen((v) => !v)}
      >
        <svg {...svg}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
        More
      </button>

      {moreOpen && (
        <div className="feed-more" role="menu">
          {ADMIN_MORE.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              role="menuitem"
              className="feed-more__item"
              aria-current={pathname === m.to ? 'page' : undefined}
            >
              {m.icon}
              {m.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}