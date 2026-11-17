import { useEffect, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { formatEventDate, refresh } from '../lib/volunteer';

const EMPTY = { title: '', location: '', event_date: '', time_label: '', role: '', slots: '10', summary: '', reminder: '' };

/* Admin: create and delete volunteer events (/admin/events) */
export default function AdminEvents() {
  const user = useUser();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setRows(data || []);
  }

  useEffect(() => {
    document.title = 'Admin: Events – GCare';
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function add(e) {
    e.preventDefault();
    const { title, location, event_date, time_label, role, summary } = form;
    if (!title.trim() || !location.trim() || !event_date || !time_label.trim() || !role.trim() || !summary.trim()) {
      return setMsg('Fill in all fields except the reminder.');
    }
    const slots = Number(form.slots);
    if (!slots || slots < 1) return setMsg('Slots must be at least 1.');
    const { error } = await supabase.from('events').insert({
      title: title.trim(), location: location.trim(), event_date, time_label: time_label.trim(),
      role: role.trim(), slots, summary: summary.trim(), reminder: form.reminder.trim(),
    });
    if (error) return setMsg(error.message);
    setForm(EMPTY);
    setMsg('Event created.');
    load();
    refresh();
  }

  async function remove(ev) {
    if (!window.confirm(`Delete "${ev.title}" and its signups?`)) return;
    await supabase.from('events').delete().eq('id', ev.id);
    load();
    refresh();
  }

  if (!user) return null;

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin events">
          <h1 className="rpt__title">Admin: Events</h1>
          <p className="rpt__sub">Create volunteer events. Residents see them on the Volunteer page.</p>

          <form className="rpt-form" onSubmit={add} style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <input className="rtext" placeholder="Title" value={form.title} onChange={set('title')} />
            <input className="rtext" placeholder="Location" value={form.location} onChange={set('location')} />
            <input className="rtext" type="date" value={form.event_date} onChange={set('event_date')} />
            <input className="rtext" placeholder="Time (e.g. 8:00 AM – 12:00 PM)" value={form.time_label} onChange={set('time_label')} />
            <input className="rtext" placeholder="Role (e.g. Packing Volunteer)" value={form.role} onChange={set('role')} />
            <input className="rtext" type="number" min="1" placeholder="Slots" value={form.slots} onChange={set('slots')} />
            <textarea className="rtext" rows={3} placeholder="Summary" value={form.summary} onChange={set('summary')} />
            <input className="rtext" placeholder="Reminder (optional)" value={form.reminder} onChange={set('reminder')} />
            {msg && <p className="rtoast" role="status">{msg}</p>}
            <button type="submit" className="rpt-publish">Create Event</button>
          </form>

          <div className="adm-list">
            {rows.length === 0 && <p className="rempty">No events yet.</p>}
            {rows.map((ev) => (
              <article key={ev.id} className="adm-row">
                <div className="adm-row__main">
                  <strong>{ev.title}</strong>
                  <span>{formatEventDate(ev.event_date)} · {ev.time_label} · {ev.location}</span>
                  <p>{ev.role} · {ev.slots} slots</p>
                </div>
                <div className="adm-row__actions">
                  <button type="button" className="vlink vlink--cancel" onClick={() => remove(ev)}>Delete</button>
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
