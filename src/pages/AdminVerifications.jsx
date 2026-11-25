import { useCallback, useEffect, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { useUser } from '../lib/auth';
import { listVerifications, reviewVerification, signedUrl } from '../lib/verification';
import { formatDateTime } from '../lib/reports';

const BADGE = { pending: 'pending', approved: 'resolved', rejected: 'review' };
const LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const closeBtn = {
  position: 'absolute',
  top: 16,
  right: 16,
  padding: '10px 18px',
  borderRadius: 999,
  border: 'none',
  background: '#fff',
  color: '#1b2437',
  fontWeight: 700,
  cursor: 'pointer',
};

function Viewer({ url, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <button type="button" style={closeBtn} onClick={onClose}>✕ Close</button>
      <p style={{ color: '#fff', marginBottom: 12, fontWeight: 600 }}>{title}</p>
      <img
        src={url}
        alt={title}
        style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function SecureImg({ path, alt, onOpen }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let alive = true;
    signedUrl(path).then((u) => alive && setUrl(u));
    return () => { alive = false; };
  }, [path]);
  if (!path) return null;
  if (!url) return <span>Loading image…</span>;
  return (
    <button
      type="button"
      onClick={() => onOpen(url, alt)}
      style={{ border: 'none', background: 'none', padding: 0, cursor: 'zoom-in' }}
      aria-label={`View ${alt}`}
    >
      <img src={url} alt={alt} className="adm-row__img" />
    </button>
  );
}

export default function AdminVerifications() {
  const user = useUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [viewer, setViewer] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const { rows: r, error: e } = await listVerifications();
    setRows(r);
    setError(e || '');
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'ID Verifications – GCare';
    load();
  }, [load]);

  async function approve(r) {
    if (!window.confirm(`Approve ${r.name}'s ID?\n\nThey will get a verified badge.`)) return;
    setBusyId(r.user_id);
    const res = await reviewVerification(r.user_id, 'approved');
    setBusyId(null);
    if (!res.ok) setError(res.error);
    load();
  }

  async function reject(r) {
    const reason = window.prompt(`Reason for rejecting ${r.name}'s ID:`);
    if (reason === null) return;
    if (!reason.trim()) {
      window.alert('Please enter a reason so the user knows what to fix.');
      return;
    }
    if (!window.confirm(`Reject ${r.name}'s ID?\n\nReason: ${reason.trim()}`)) return;
    setBusyId(r.user_id);
    const res = await reviewVerification(r.user_id, 'rejected', reason);
    setBusyId(null);
    if (!res.ok) setError(res.error);
    load();
  }

  const shown = rows.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="ID Verifications">
          <h1 className="rpt__title">Admin: ID Verifications</h1>
          <p className="rpt__sub">Review submitted IDs. Click a picture to enlarge it. Only admins can see these images.</p>

          <div className="rchips" role="group" aria-label="Filter">
            {[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} className={`rchip ${filter === id ? 'rchip--on' : ''}`.trim()} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>

          {error && <p className="rerr">{error}</p>}

          <div className="adm-list">
            {loading && <p className="rempty">Loading…</p>}
            {!loading && shown.length === 0 && <p className="rempty">Nothing here.</p>}
            {shown.map((r) => (
              <article key={r.user_id} className="adm-row">
                <SecureImg path={r.id_path} alt={`${r.name}'s ID`} onOpen={(url, title) => setViewer({ url, title })} />
                <SecureImg path={r.selfie_path} alt={`${r.name}'s selfie with ID`} onOpen={(url, title) => setViewer({ url, title })} />
                <div className="adm-row__main">
                  <strong>{r.name} {r.status === 'approved' && <VerifiedBadge size={18} />}</strong>
                  <span>Submitted {formatDateTime(r.submitted_at)}</span>
                  {r.status === 'rejected' && <span>Reason: {r.reject_reason}</span>}
                </div>
                <div className="adm-row__actions">
                  <span className={`rbadge rbadge--${BADGE[r.status]}`}>{LABEL[r.status]}</span>
                  <button type="button" className="cmap__btn cmap__btn--primary" disabled={r.status === 'approved' || busyId === r.user_id} onClick={() => approve(r)}>Approve</button>
                  <button type="button" className="cmap__btn" disabled={r.status === 'rejected' || busyId === r.user_id} onClick={() => reject(r)}>Reject</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {viewer && <Viewer url={viewer.url} title={viewer.title} onClose={() => setViewer(null)} />}
      <BottomNav />
    </div>
  );
}