import { useEffect } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { SIGNUP_STATUS, eventOf, formatEventDate, setSignupStatus, useSignups } from '../lib/volunteer';

const BADGE = { pending: 'review', approved: 'resolved', rejected: 'rejected' };

export default function AdminVolunteers() {
  const user = useUser();
  const signups = useSignups();

  useEffect(() => {
    document.title = 'Admin: Volunteers – GCare';
  }, []);

  if (!user) return null;

  const order = { pending: 0, approved: 1, rejected: 2 };
  const list = [...signups].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin volunteers">
          <h1 className="rpt__title">Admin: Volunteers</h1>
          <p className="rpt__sub">Approve or reject volunteer signups. Residents see the status in My Activities.</p>

          <div className="adm-list">
            {list.length === 0 && <p className="rempty">No signups yet.</p>}
            {list.map((s) => {
              const e = eventOf(s.eventId);
              return (
                <article key={s.id} className="adm-row">
                  <div className="adm-row__main">
                    <strong>{s.name || s.email}</strong>
                    <span>{s.email}</span>
                    <p>{e ? `${e.title} · ${formatEventDate(e.date)} · ${e.time}` : 'Event removed'}</p>
                  </div>
                  <div className="adm-row__actions">
                    <span className={`rbadge rbadge--${BADGE[s.status]}`}>{SIGNUP_STATUS[s.status].label}</span>
                    <button type="button" className="cmap__btn cmap__btn--primary" disabled={s.status === 'approved'} onClick={() => setSignupStatus(s.id, 'approved')}>Approve</button>
                    <button type="button" className="cmap__btn" disabled={s.status === 'rejected'} onClick={() => setSignupStatus(s.id, 'rejected')}>Reject</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
