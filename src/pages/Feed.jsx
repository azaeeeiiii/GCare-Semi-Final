import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import IncidentMap from '../components/IncidentMap';
import { ArrowRight } from '../components/ui';
import { useUser } from '../lib/auth';
import { newsItems } from '../content';

/* Feed page (members only, see RequireAuth in App.jsx). Browse-only:
   reports on the left, a map of where they happened on the right. Reporting lives on the Report page. */

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const MegaphoneIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>
);
const PinIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
const CalendarIcon = () => (
  <svg {...svg} className="feed-icon feed-icon--sm"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
);
const FeedIcon = () => (
  <svg {...svg} className="feed-nav__icon"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const ReportIcon = () => (
  <svg {...svg} className="feed-nav__icon"><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6" /></svg>
);
const VolunteerIcon = () => (
  <svg {...svg} className="feed-nav__icon"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
);
const ProfileIcon = () => (
  <svg {...svg} className="feed-nav__icon"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);

function NewsCard({ item, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      id={`card-${item.id}`}
      className={`news-card ${selected ? 'news-card--selected' : ''}`.trim()}
      onClick={() => onSelect(item.id)}
    >
      {item.image ? (
        <img src={item.image} alt="" className="news-card__img" loading="lazy" />
      ) : (
        <div className="news-card__img news-card__img--empty" style={{ '--tone': item.tone }} aria-hidden="true">
          <MegaphoneIcon />
        </div>
      )}

      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__tag">{item.tag}</span>
          <time className="news-card__date"><CalendarIcon />{item.date}</time>
        </div>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__where">{item.location}</p>
        <p className={`news-card__text ${open ? '' : 'news-card__text--clamp'}`.trim()}>
          {item.excerpt}
          {open && <><br />{item.body}</>}
        </p>
      </div>

      <button
        type="button"
        className="news-card__go"
        aria-expanded={open}
        aria-label={open ? `Show less: ${item.title}` : `Read more: ${item.title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <ArrowRight className={`arrow-right ${open ? 'news-card__go-icon--open' : ''}`.trim()} />
      </button>
    </article>
  );
}

const NAV = [
  { to: '/feed', label: 'Feed', icon: <FeedIcon /> },
  { to: '/report', label: 'Report', icon: <ReportIcon /> },
  { to: '/volunteer', label: 'Volunteer', icon: <VolunteerIcon /> },
  { to: '/profile', label: 'Profile', icon: <ProfileIcon /> },
];

export default function Feed() {
  const user = useUser();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.title = 'Feed – GCare';
  }, []);

  // Picking a card (or a pin) highlights both; on phones the map sits below the list, so scroll to it
  function select(id, fromCard = true) {
    setSelectedId(id);
    if (fromCard && window.matchMedia('(max-width: 860px)').matches) {
      document.getElementById('exploreTitle')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!fromCard) {
      document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  return (
    <div className="feed">
      <FeedHeader user={user} />

      <main className="feed__main">
        <section className="feed-panel feed-news" aria-labelledby="newsTitle">
          <header className="feed-panel__head">
            <h1 id="newsTitle" className="feed-panel__title"><MegaphoneIcon />Latest News</h1>
            <Link to="/news" className="feed-pill feed-pill--light">View All<ArrowRight className="arrow-right-small" /></Link>
          </header>
          <div className="feed-news__list" tabIndex={0} aria-label="News list">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} selected={item.id === selectedId} onSelect={(id) => select(id, true)} />
            ))}
          </div>
        </section>

        <section className="feed-panel feed-explore" aria-labelledby="exploreTitle">
          <header className="feed-panel__head">
            <h2 id="exploreTitle" className="feed-panel__title"><PinIcon />Explore Your Community</h2>
          </header>
          <IncidentMap items={newsItems} selectedId={selectedId} onSelect={(id) => select(id, false)} />
        </section>
      </main>

      <nav className="feed-nav" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="feed-nav__item" aria-current={n.to === '/feed' ? 'page' : undefined}>
            {n.icon}
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
