import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'feed-nav__icon' };

const img = (file) => <img src={`/images/${file}`} alt="" aria-hidden="true" className="feed-nav__icon feed-nav__icon--img" />;

const NAV = [
  { to: '/feed', label: 'Feed', icon: img('feed_icon.png') },
  { to: '/report', label: 'Report', icon: img('report_icon.png') },
  { to: '/volunteer', label: 'Volunteer', icon: img('volunteer_icon.png') },
  { to: '/profile', label: 'Profile', icon: img('profile_icon.png') },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Reports', icon: <svg {...svg}><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" /></svg> },
  { to: '/admin/volunteers', label: 'Volunteers', icon: img('volunteer_icon.png') },
  { to: '/admin/alerts', label: 'Alerts', icon: <svg {...svg}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" /></svg> },
  { to: '/admin/events', label: 'Events', icon: <svg {...svg}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg> },
  { to: '/admin/news', label: 'News', icon: <svg {...svg}><path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h6M8 13h6" /></svg> },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const user = useUser();
  const items = user?.isAdmin && pathname.startsWith('/admin') ? ADMIN_NAV : NAV;

  return (
    <nav className="feed-nav" aria-label="Main">
      {items.map((n) => (
        <Link key={n.to} to={n.to} className="feed-nav__item" aria-current={pathname === n.to ? 'page' : undefined}>
          {n.icon}
          {n.label}
        </Link>
      ))}
    </nav>
  );
}