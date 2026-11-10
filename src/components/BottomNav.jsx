import { Link, useLocation } from 'react-router-dom';

/* Bottom navigation shared by the Feed and Report pages */

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'feed-nav__icon' };

const NAV = [
  { to: '/feed', label: 'Feed', icon: <svg {...svg}><path d="M4 6h16M4 12h16M4 18h16" /></svg> },
  { to: '/report', label: 'Report', icon: <svg {...svg}><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6" /></svg> },
  { to: '/volunteer', label: 'Volunteer', icon: <svg {...svg}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg> },
  { to: '/profile', label: 'Profile', icon: <svg {...svg}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg> },
];

export default function BottomNav() {
  const { pathname } = useLocation();
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
