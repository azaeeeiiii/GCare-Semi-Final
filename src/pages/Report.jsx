import { useEffect, useMemo, useRef, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReportMap, { MiniMap } from '../components/ReportMap';
import PhotoField from '../components/PhotoField';
import { UserIcon } from '../components/ui';
import { useUser } from '../lib/auth';
import { AREA } from '../lib/serviceArea';
import { CATEGORIES, STATUS, addReport, categoryOf, formatDate, formatDateTime, useReports } from '../lib/reports';

/* Report page (members only): "Report" tab = create a report, "My Reports" tab = track its status.
   Only the admin can change a report's status (see Admin.jsx). */

const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'rfield-icon' };
const TitleIcon = () => <svg {...ic}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
const GridIcon = () => <svg {...ic}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
const PinSmall = () => <svg {...ic}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const SearchIcon = () => <svg {...ic}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
const SendIcon = () => <svg {...ic} className="rfield-icon rfield-icon--lg"><path d="M21 4 3 11l7 3 3 7z" /><path d="M10 14 21 4" /></svg>;
const ChevronIcon = () => <svg {...ic} className="rchev"><path d="m9 6 6 6-6 6" /></svg>;

const DEFAULT_PIN = { lat: AREA.center[0], lng: AREA.center[1] };

function Head({ title, sub, tab, setTab }) {
  return (
    <>
      <h1 className="rpt__title">{title}</h1>
      <p className="rpt__sub">{sub}</p>
      <div className="rpt-tabs" role="tablist">
        {[['report', 'Report'], ['mine', 'My Reports']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`rpt-tabs__btn ${tab === id ? 'rpt-tabs__btn--on' : ''}`.trim()} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

function Badge({ status }) {
  return <span className={`rbadge rbadge--${status}`}>{STATUS[status].label}</span>;
}

/* Defined at module level (not inside ReportForm) so inputs keep focus while typing */
function Field({ id, label, icon, error, children }) {
  return (
    <div className="rfield">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className={`auth-field ${error ? 'auth-field--invalid' : ''}`.trim()}>
        {icon}
        {children}
      </div>
      {error && <p className="rerr">{error}</p>}
    </div>
  );
}

/* ------------------------- Report tab ------------------------- */
function ReportForm({ user, tab, setTab, onPublished }) {
  const [form, setForm] = useState({ title: '', category: '', location: '', summary: '' });
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [photo, setPhoto] = useState('');
  const [pinned, setPinned] = useState(false); // has the user (or GPS) actually set the pin?
  const [errors, setErrors] = useState({});
  const locEdited = useRef(false);

  const set = (k) => (e) => {
    if (k === 'location') locEdited.current = true;
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  /* Fill the Location box from the pin (OpenStreetMap Nominatim), unless the user typed their own */
  useEffect(() => {
    if (!pinned) return undefined;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${pin.lat}&lon=${pin.lng}`, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        const d = await r.json();
        const a = d.address || {};
        const label = [a.road, a.suburb || a.neighbourhood || a.quarter || a.village, a.city || a.town || a.municipality].filter(Boolean).join(', ') || d.display_name || '';
        if (label && !locEdited.current) setForm((f) => ({ ...f, location: label }));
      } catch {
        /* offline or aborted: the user can type the location */
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [pin, pinned]);

  function submit(e) {
    e.preventDefault();
    const er = {};
    if (form.title.trim().length < 3) er.title = 'Enter a short title (at least 3 characters).';
    if (!form.category) er.category = 'Choose a category.';
    if (!form.location.trim()) er.location = 'Enter the location, or pin it on the map.';
    if (form.summary.trim().length < 10) er.summary = 'Write a short summary (at least 10 characters).';
    if (!pinned) er.pin = 'Pin the exact spot on the map first.';
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      const report = addReport({ ...form, photo, lat: pin.lat, lng: pin.lng, user });
      onPublished(report.id);
    } catch {
      // browser storage is full (photos are big). Not an issue once a backend stores them.
      setErrors({ photo: 'Couldn’t save the report: browser storage is full. Remove the photo or delete older reports and try again.' });
    }
  }

  return (
    <form className="rpt-form" onSubmit={submit} noValidate>
      <div className="rpt-cols">
        <div className="rpt-col">
          <Head title="Report" sub="Help build a safer and more prepared community" tab={tab} setTab={setTab} />

          <Field id="rTitle" label="News Title" icon={<TitleIcon />} error={errors.title}>
            <input id="rTitle" className="auth-input" value={form.title} onChange={set('title')} placeholder="e.g. Road Closure Advisory" maxLength={90} />
          </Field>

          <Field id="rCat" label="Category" icon={<GridIcon />} error={errors.category}>
            <select id="rCat" className="auth-input rselect" value={form.category} onChange={set('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>

          <Field id="rLoc" label="Location" icon={<PinSmall />} error={errors.location}>
            <input id="rLoc" className="auth-input" value={form.location} onChange={set('location')} placeholder="e.g. Mars Street" maxLength={120} />
          </Field>

          <Field id="rBy" label="Reported by" icon={<UserIcon />}>
            <input id="rBy" className="auth-input" value={user.name} readOnly />
          </Field>

          <PhotoField value={photo} onChange={(v) => { setPhoto(v); setErrors((er) => ({ ...er, photo: undefined })); }} error={errors.photo} />
        </div>

        <div className="rpt-col">
          <p className="rpt-maplabel">Pin the exact spot</p>
          <p className="rpt-mapsub">Drag the marker to the exact location on the map</p>
          <ReportMap
            pin={pin}
            onPin={(lat, lng) => {
              setPin({ lat, lng });
              setPinned(true);
              setErrors((er) => ({ ...er, pin: undefined }));
            }}
          />
          {errors.pin && <p className="rerr">{errors.pin}</p>}

          <div className="rfield">
            <label className="rpt-maplabel" htmlFor="rSum">Short Summary</label>
            <textarea id="rSum" className={`rtext ${errors.summary ? 'rtext--invalid' : ''}`.trim()} value={form.summary} onChange={set('summary')} placeholder="Write a short summary of the incident" rows={4} maxLength={600} />
            {errors.summary && <p className="rerr">{errors.summary}</p>}
          </div>
        </div>
      </div>

      <button type="submit" className="rpt-publish"><SendIcon />Publish to Community Feed</button>
    </form>
  );
}

/* ------------------------- My Reports tab ------------------------- */
function Timeline({ report }) {
  return (
    <ol className="rtl">
      {report.timeline.map((t, i) => {
        const last = i === report.timeline.length - 1;
        const label = t.status === 'pending' ? 'Report Submitted' : STATUS[t.status].label;
        return (
          <li key={`${t.status}-${t.at}`} className={`rtl__item ${last ? `rtl__item--now rtl__item--${t.status}` : ''}`.trim()}>
            <span className="rtl__dot" aria-hidden="true" />
            <strong>{last && t.status !== 'pending' ? `Currently ${label}` : label}</strong>
            <span className="rtl__when">{last && t.status === 'pending' ? STATUS.pending.note : last ? STATUS[t.status].note : formatDateTime(t.at)}</span>
            {last && t.status !== 'pending' && <span className="rtl__when">{formatDateTime(t.at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function MyReports({ user, tab, setTab, focusId }) {
  const all = useReports();
  const mine = useMemo(() => all.filter((r) => r.authorEmail === user.email), [all, user.email]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [picked, setPicked] = useState(focusId);

  const shown = mine.filter(
    (r) => (filter === 'all' || r.status === filter) && `${r.title} ${r.summary} ${r.location}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const current = mine.find((r) => r.id === picked) || shown[0] || null;

  return (
    <div className="rpt-cols">
      <div className="rpt-col">
        <Head title="My Reports" sub="Track the status of your submitted reports." tab={tab} setTab={setTab} />

        <div className="auth-field rsearch">
          <SearchIcon />
          <input className="auth-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your reports..." aria-label="Search your reports" />
        </div>

        <div className="rchips" role="group" aria-label="Filter by status">
          {[['all', 'All'], ['pending', 'Pending'], ['review', 'Under Review'], ['resolved', 'Resolved']].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} className={`rchip ${filter === id ? 'rchip--on' : ''}`.trim()} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>

        <div className="rlist">
          {mine.length === 0 && <p className="rempty">You haven’t submitted any reports yet. Use the Report tab to publish your first one.</p>}
          {mine.length > 0 && shown.length === 0 && <p className="rempty">No reports match your search.</p>}
          {shown.map((r) => (
            <button key={r.id} type="button" className={`rcard ${current?.id === r.id ? 'rcard--on' : ''}`.trim()} onClick={() => setPicked(r.id)}>
              <span className="rcard__img" style={{ '--tone': categoryOf(r.category).tone, backgroundImage: r.photo ? `url(${r.photo})` : undefined }} aria-hidden="true" />
              <span className="rcard__body">
                <strong className="rcard__title">{r.title}</strong>
                <span className="rcard__date">{formatDate(r.createdAt)}</span>
                <span className="rcard__text">{r.summary}</span>
              </span>
              <span className="rcard__side"><Badge status={r.status} /><ChevronIcon /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="rpt-col">
        {current ? (
          <article className="rdetail">
            <header
              className="rdetail__hero"
              style={{
                '--tone': categoryOf(current.category).tone,
                backgroundImage: current.photo ? `linear-gradient(180deg, rgb(27 36 55 / 0.15), rgb(27 36 55 / 0.88)), url(${current.photo})` : undefined,
              }}
            >
              <Badge status={current.status} />
              <h2>{current.title}</h2>
              <p>{current.location} · {categoryOf(current.category).label}</p>
              <p>{formatDateTime(current.createdAt)}</p>
            </header>
            <div className="rdetail__body">
              <h3>Report Details</h3>
              <p>{current.summary}</p>
              <MiniMap lat={current.lat} lng={current.lng} />
              <h3>Report Timeline</h3>
              <Timeline report={current} />
              <p className="rnote">You will be notified once there are updates on your report.</p>
            </div>
          </article>
        ) : (
          <p className="rempty rempty--panel">Select a report to see its details and timeline.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Page ------------------------- */
export default function Report() {
  const user = useUser();
  const [tab, setTab] = useState('report');
  const [focusId, setFocusId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = 'Report – GCare';
  }, []);

  function published(id) {
    setFocusId(id);
    setTab('mine');
    setToast('Your report was published to the community feed.');
    setTimeout(() => setToast(''), 5000);
  }

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Reports">
          {toast && <p role="status" className="rtoast">{toast}</p>}
          {tab === 'report'
            ? <ReportForm user={user} tab={tab} setTab={setTab} onPublished={published} />
            : <MyReports key={focusId || 'mine'} user={user} tab={tab} setTab={setTab} focusId={focusId} />}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}