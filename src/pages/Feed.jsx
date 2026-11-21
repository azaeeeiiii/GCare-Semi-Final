import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import IncidentMap from '../components/IncidentMap';
import ReportCard from '../components/ReportCard';
import { ArrowRight } from '../components/ui';
import { useUser } from '../lib/auth';
import { toFeedItem, useReportsState } from '../lib/reports';
import { pointInPolygon } from '../lib/serviceArea';

/* Feed page (members only, see RequireAuth in App.jsx). Browse-only:
   the latest resident reports on the left, a map of where they happened on the right.
   - "View All" opens /reports (every report).
   - "Announcements" opens /news (alerts + news posted by the admin).
   Reporting lives on the Report page. */

const LATEST_COUNT = 6; // cards shown in the left list; the rest are on /reports

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const ReportsIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M12 3 2 20h20L12 3zM12 10v4M12 17.5v.01" /></svg>
);
const MegaphoneIcon = () => (
  <svg {...svg} className="feed-icon feed-icon--sm"><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>
);
const PinIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

export default function Feed() {
  const user = useUser();
  const { reports, loading, error } = useReportsState();

  // only reports inside the service area (same rule as the map), newest first
  const items = useMemo(
    () => reports.map(toFeedItem).filter((i) => pointInPolygon([i.lat, i.lng])),
    [reports],
  );
  const latest = items.slice(0, LATEST_COUNT);
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
            <h1 id="newsTitle" className="feed-panel__title"><ReportsIcon />Latest Reports</h1>
            <Link to="/reports" className="feed-pill feed-pill--light">View All<ArrowRight className="arrow-right-small" /></Link>
          </header>

          <Link to="/news" className="feed-announce">
            <MegaphoneIcon />
            <span><strong>Announcements &amp; Alerts</strong> from the GCare team</span>
            <ArrowRight className="arrow-right-small" />
          </Link>

          <div className="feed-news__list" tabIndex={0} aria-label="Latest reports from residents">
            {loading && <p className="feed-news__empty">Loading reports…</p>}
            {!loading && error && <p className="feed-news__empty">{error}</p>}
            {!loading && !error && latest.length === 0 && (
              <p className="feed-news__empty">
                No reports yet. If you see a flood, fire or other hazard, <Link to="/report">report it here</Link>.
              </p>
            )}
            {latest.map((item) => (
              <ReportCard key={item.id} item={item} selected={item.id === selectedId} onSelect={(id) => select(id, true)} />
            ))}
            {items.length > LATEST_COUNT && (
              <Link to="/reports" className="feed-news__more">See all {items.length} reports<ArrowRight className="arrow-right-small" /></Link>
            )}
          </div>
        </section>

        <section className="feed-panel feed-explore" aria-labelledby="exploreTitle">
          <header className="feed-panel__head">
            <h2 id="exploreTitle" className="feed-panel__title"><PinIcon />Explore Your Community</h2>
          </header>
          <IncidentMap items={items} selectedId={selectedId} onSelect={(id) => select(id, false)} />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
