import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { STATUS, categoryOf, deleteReport, formatDateTime, setReportStatus, useReportsState } from '../lib/reports';


export default function Admin() {
  const user = useUser();
  const { reports, loading } = useReportsState();

  useEffect(() => {
    document.title = 'Admin – GCare';
  }, []);

  function markResolved(r) {
    if (!window.confirm(`Mark "${r.title}" as resolved?\n\nThe resident will be notified.`)) return;
    setReportStatus(r.id, 'resolved');
  }

  function remove(r) {
    if (!window.confirm(`Delete "${r.title}"?\n\nThis cannot be undone.`)) return;
    deleteReport(r.id);
  }

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin">
          <h1 className="rpt__title">Admin: Reports</h1>
          <p className="rpt__sub">Review incoming reports and mark them resolved. Residents see the status in My Reports.</p>
          <p><Link to="/admin/verifications" className="cmap__btn cmap__btn--primary">ID Verifications</Link></p>

          <div className="adm-list">
            {loading && <p className="rempty">Loading reports…</p>}
            {!loading && reports.length === 0 && <p className="rempty">No reports yet.</p>}
            {reports.map((r) => (
              <article key={r.id} className="adm-row">
                {r.photo && <img src={r.photo} alt="" className="adm-row__img" />}
                <div className="adm-row__main">
                  <strong>{r.title}</strong>
                  <span>{categoryOf(r.category).label} · {r.location}</span>
                  <span>By {r.authorName} · {formatDateTime(r.createdAt)}</span>
                  <p>{r.summary}</p>
                </div>
                <div className="adm-row__actions">
                  <span className={`rbadge rbadge--${r.status}`}>{STATUS[r.status].label}</span>
                  <button type="button" className="cmap__btn" disabled={r.status !== 'pending'} onClick={() => setReportStatus(r.id, 'review')}>Start review</button>
                  <button type="button" className="cmap__btn cmap__btn--primary" disabled={r.status === 'resolved'} onClick={() => markResolved(r)}>Mark resolved</button>
                  <button type="button" className="vlink vlink--cancel" onClick={() => remove(r)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}