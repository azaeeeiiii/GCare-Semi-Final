import { useEffect } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { STATUS, categoryOf, formatDateTime, setReportStatus, useReports } from '../lib/reports';

/* TEMPORARY admin page (demo only): the admin moves reports Pending -> Under Review -> Resolved.
   Log in with admin@gcare.local / admin123. Replace with the real admin panel + server checks later. */

export default function Admin() {
  const user = useUser();
  const reports = useReports();

  useEffect(() => {
    document.title = 'Admin – GCare';
  }, []);

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin">
          <h1 className="rpt__title">Admin: Reports</h1>
          <p className="rpt__sub">Review incoming reports and mark them resolved. Residents see the status in My Reports.</p>

          <div className="adm-list">
            {reports.length === 0 && <p className="rempty">No reports yet.</p>}
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
                  <button type="button" className="cmap__btn cmap__btn--primary" disabled={r.status === 'resolved'} onClick={() => setReportStatus(r.id, 'resolved')}>Mark resolved</button>
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