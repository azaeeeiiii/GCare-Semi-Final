import { useEffect, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { ALERT_LEVELS, createAlert, fetchAllAlerts, removeAlert, setAlertActive } from '../lib/alerts';
import { formatDateTime } from '../lib/reports';

const EMPTY = { level: 'warning', title: '', area: '', body: '' };

export default function AdminAlerts() {
  const user = useUser();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  async function load() {
    const { rows: list } = await fetchAllAlerts();
    setRows(list);
  }

  useEffect(() => {
    document.title = 'Admin: Alerts – GCare';
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    const body = form.body.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!form.title.trim() || !form.area.trim() || body.length === 0) return setMsg('Fill in the title, area and message.');
    const { error } = await createAlert({ level: form.level, title: form.title.trim(), area: form.area.trim(), body });
    if (error) return setMsg(error.message);
    setForm(EMPTY);
    setMsg('Alert posted.');
    load();
  }

  async function toggle(a) {
    const next = !a.active;
    if (!window.confirm(`${next ? 'Reactivate' : 'Lift'} "${a.title}"?`)) return;
    const { error } = await setAlertActive(a.id, next);
    if (error) return setMsg(error.message);
    load();
  }

  async function remove(a) {
    if (!window.confirm(`Delete "${a.title}"?\n\nThis cannot be undone.`)) return;
    const { error } = await removeAlert(a.id);
    if (error) return setMsg(error.message);
    load();
  }

  if (!user) return null;

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin alerts">
          <h1 className="rpt__title">Admin: Alerts</h1>
          <p className="rpt__sub">Post a new alert or lift an old one. Residents see them on the News page.</p>

          <form className="rpt-form" onSubmit={add} style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <select className="rtext" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {Object.entries(ALERT_LEVELS).map(([id, l]) => <option key={id} value={id}>{l.label}</option>)}
            </select>
            <input className="rtext" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="rtext" placeholder="Area (e.g. Batangas City)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            <textarea className="rtext" rows={4} placeholder="Message (one paragraph per line)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            {msg && <p className="rtoast" role="status">{msg}</p>}
            <button type="submit" className="rpt-publish">Post Alert</button>
          </form>

          <div className="adm-list">
            {rows.length === 0 && <p className="rempty">No alerts yet.</p>}
            {rows.map((a) => (
              <article key={a.id} className="adm-row">
                <div className="adm-row__main">
                  <strong>{a.title}</strong>
                  <span>{ALERT_LEVELS[a.level]?.label} · {a.area} · {formatDateTime(a.issued_at)}</span>
                  <p>{(a.body || []).join(' ')}</p>
                </div>
                <div className="adm-row__actions">
                  <span className={`rbadge ${a.active ? 'rbadge--resolved' : 'rbadge--pending'}`}>{a.active ? 'Active' : 'Lifted'}</span>
                  <button type="button" className="cmap__btn" onClick={() => toggle(a)}>{a.active ? 'Lift' : 'Reactivate'}</button>
                  <button type="button" className="vlink vlink--cancel" onClick={() => remove(a)}>Delete</button>
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