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

const LATEST_COUNT = 6; 

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const ReportsIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M12 3 2 20h20L12 3zM12 10v4M12 17.5v.01" /></svg>
);

const PinIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

export default function Feed() {
  const user = useUser();
  const { reports, loading, error } = useReportsState();

  const items = useMemo(
    () => reports.map(toFeedItem).filter((i) => pointInPolygon([i.lat, i.lng])),
    [reports],
  );
  const latest = items.slice(0, LATEST_COUNT);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.title = 'Feed – GCare';
  }, []);

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
            {items.length > LATEST_COUNT && (
              <Link to="/reports" className="feed-news__more">See all {items.length} reports<ArrowRight className="arrow-right-small" /></Link>
            )}
          </header>

          <Link to="/news" className="feed-announce">
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
