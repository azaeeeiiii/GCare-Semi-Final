import { useCallback, useEffect, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { listContactMessages, setContactRead } from '../lib/contact';
import { formatDateTime } from '../lib/reports';
import { CONTACT } from '../content';

export default function AdminContact() {
  const user = useUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('unread');
  const [category, setCategory] = useState('all');

  const load = useCallback(async () => {
    const { rows: r, error: e } = await listContactMessages();
    setRows(r);
    setError(e || '');
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'Messages – GCare';
    load();
  }, [load]);

  async function toggleRead(r) {
    const res = await setContactRead(r.id, !r.is_read);
    if (!res.ok) setError(res.error);
    load();
  }

  const unreadCount = rows.filter((r) => !r.is_read).length;
  const shown = rows.filter(
    (r) => (view === 'all' || !r.is_read) && (category === 'all' || r.category === category),
  );

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Messages">
          <h1 className="rpt__title">Admin: Messages</h1>
          <p className="rpt__sub">Suggestions and concerns sent through the Contact Us page.</p>

          <div className="rchips" role="group" aria-label="Filter by status">
            {[['unread', `Unread (${unreadCount})`], ['all', 'All']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                className={`rchip ${view === id ? 'rchip--on' : ''}`.trim()}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rchips" role="group" aria-label="Filter by category">
            {[['all', 'All categories'], ...CONTACT.categories.map((c) => [c, c])].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={category === id}
                className={`rchip ${category === id ? 'rchip--on' : ''}`.trim()}
                onClick={() => setCategory(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <p className="rerr">{error}</p>}

          <div className="adm-list">
            {loading && <p className="rempty">Loading…</p>}
            {!loading && shown.length === 0 && <p className="rempty">No messages here.</p>}
            {shown.map((r) => (
              <article key={r.id} className="adm-row">
                <div className="adm-row__main">
                  <strong>{r.category}</strong>
                  <span>
                    From {r.author_name || 'Anonymous'}
                    {r.author_email ? ` (${r.author_email})` : ''}
                    {` · ${r.user_id ? 'Member' : 'Guest'}`}
                    {r.created_at ? ` · ${formatDateTime(r.created_at)}` : ''}
                  </span>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.message}</p>
                </div>
                <div className="adm-row__actions">
                  <span className={`rbadge rbadge--${r.is_read ? 'resolved' : 'pending'}`}>
                    {r.is_read ? 'Read' : 'Unread'}
                  </span>
                  <button type="button" className="cmap__btn" onClick={() => toggleRead(r)}>
                    {r.is_read ? 'Mark as unread' : 'Mark as read'}
                  </button>
                  {r.author_email && (
                    <a
                      className="cmap__btn cmap__btn--primary"
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(r.author_email)}&su=${encodeURIComponent(`Re: ${r.category} – GCare`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Reply
                    </a>
                  )}
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