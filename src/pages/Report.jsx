import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReportCard from '../components/ReportCard';
import { useUser } from '../lib/auth';
import { CATEGORIES, GROUPS, toFeedItem, useReportsState } from '../lib/reports';


const TYPES = [['all', 'All'], ['disaster', GROUPS.disaster.label], ['risk', GROUPS.risk.label]];
const STATES = [['all', 'Any status'], ['pending', 'Pending'], ['review', 'Under Review'], ['resolved', 'Resolved']];

export default function Reports() {
  const user = useUser();
  const { reports, loading, error } = useReportsState();
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  // NEW: a notification can link here with ?report=ID to highlight that report.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('report');
  const [selectedId, setSelectedId] = useState(focusId);
  const scrolledTo = useRef('');

  useEffect(() => {
    document.title = 'All Reports – GCare';
  }, []);

  useEffect(() => {
    setSelectedId(focusId);
  }, [focusId]);

  const items = useMemo(() => reports.map(toFeedItem), [reports]);

  // NEW: scroll to the highlighted report once its card exists (reports load asynchronously).
  useEffect(() => {
    if (!focusId || scrolledTo.current === focusId) return undefined;
    const t = setTimeout(() => {
      const el = document.getElementById(`card-${focusId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrolledTo.current = focusId;
      }
    }, 100);
    return () => clearTimeout(t);
  }, [focusId, items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (type === 'all' || i.group === type) &&
        (category === 'all' || i.tag === CATEGORIES.find((c) => c.id === category)?.label) &&
        (status === 'all' || i.status === status) &&
        (!q || `${i.title} ${i.excerpt} ${i.location} ${i.tag}`.toLowerCase().includes(q)),
    );
  }, [items, type, category, status, query]);

  const count = (id) => (id === 'all' ? items.length : items.filter((i) => i.group === id).length);
  const categoryChoices = CATEGORIES.filter((c) => type === 'all' || c.group === type);

  return (
    <div className="feed">
      <FeedHeader user={user} />

      <main className="feed__main rpt-main">
        <section className="rpt allrep" aria-labelledby="allTitle">
          <div className="allrep__top">
            <div>
              <h1 id="allTitle" className="rpt__title">Community Reports</h1>
              <p className="rpt__sub">Disasters and hazards reported by residents of Golden Country Homes.</p>
            </div>
            <div className="allrep__links">
              <Link to="/feed" className="cmap__btn">Back to Feed</Link>
              <Link to="/news" className="cmap__btn">Announcements</Link>
              <Link to="/report" className="cmap__btn cmap__btn--primary">Report an Incident</Link>
            </div>
          </div>

          <input
            className="rtext allrep__search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports by title, place or type..."
            aria-label="Search reports"
          />

          <div className="rchips" role="group" aria-label="Filter by type">
            {TYPES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={type === id}
                className={`rchip ${type === id ? 'rchip--on' : ''}`.trim()}
                onClick={() => { setType(id); setCategory('all'); }}
              >
                {label} ({count(id)})
              </button>
            ))}
          </div>

          <div className="allrep__selects">
            <select className="rtext" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categoryChoices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select className="rtext" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              {STATES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>

          {loading && <p className="rempty">Loading reports…</p>}
          {!loading && error && <p className="rempty">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="rempty">No reports yet. Be the first to <Link to="/report">report an incident</Link>.</p>
          )}
          {!loading && !error && items.length > 0 && shown.length === 0 && <p className="rempty">No reports match your filters.</p>}

          <div className="allrep__grid">
            {shown.map((item) => (
              <ReportCard
                key={item.id}
                item={item}
                selected={String(item.id) === String(selectedId)}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}