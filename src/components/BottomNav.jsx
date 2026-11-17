import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';

/* Bottom navigation shared by the Feed, Report, Volunteer, Profile and Admin pages.
   Residents never see anything admin. The admin menu only shows on /admin pages. */

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'feed-nav__icon' };

const NAV = [
  { to: '/feed', label: 'Feed', icon: <svg {...svg}><path d="M4 6h16M4 12h16M4 18h16" /></svg> },
  { to: '/report', label: 'Report', icon: <svg {...svg}><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6" /></svg> },
  { to: '/volunteer', label: 'Volunteer', icon: <svg {...svg}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg> },
  { to: '/profile', label: 'Profile', icon: <svg {...svg}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg> },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Reports', icon: <svg {...svg}><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" /></svg> },
  { to: '/admin/volunteers', label: 'Volunteers', icon: <svg {...svg}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg> },
  { to: '/admin/alerts', label: 'Alerts', icon: <svg {...svg}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" /></svg> },
  { to: '/admin/events', label: 'Events', icon: <svg {...svg}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg> },
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
