import { useEffect, useRef, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import {
  NEWS_CATEGORIES, fetchAllNews, uploadNewsImage, deleteNewsImage, formatNewsDate,
  saveNews, setNewsPublished, removeNews,
} from '../lib/news';

const EMPTY = { title: '', category: 'update', summary: '', body: '', image: '', published: true };

export default function AdminNews() {
  const user = useUser();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // id of the story being edited
  const [msg, setMsg] = useState({ text: '', bad: false });
  const [busy, setBusy] = useState(false);

  const say = (text, bad = false) => setMsg({ text, bad });

  async function load() {
    const { rows: list, error } = await fetchAllNews();
    if (error) say(`Could not load news: ${error.message}`, true);
    setRows(list);
  }

  useEffect(() => {
    document.title = 'Admin: News – GCare';
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function pickImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    say('');
    try {
      const url = await uploadNewsImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      say(err.message, true);
    }
    setBusy(false);
  }

  function startEdit(n) {
    setEditing(n.id);
    setForm({ title: n.title, category: n.category, summary: n.summary, body: n.body.join('\n'), image: n.image, published: n.published });
    say('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY);
    say('');
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.body.trim()) {
      return say('Fill in the title, short summary and full story.', true);
    }
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      summary: form.summary.trim(),
      body: form.body.trim(),
      image_url: form.image || '',
      published: form.published,
    };
    const { error } = await saveNews(editing, payload);
    setBusy(false);
    if (error) return say(error.message, true);
    say(editing ? 'News updated.' : 'News posted. Everyone can see it on the News page.');
    setEditing(null);
    setForm(EMPTY);
    load();
  }

  async function togglePublished(n) {
    const { error } = await setNewsPublished(n.id, !n.published);
    if (error) return say(error.message, true);
    load();
  }

  async function remove(n) {
    if (!window.confirm(`Delete "${n.title}"?\n\nThis cannot be undone.`)) return;
    const { error } = await removeNews(n.id);
    if (error) return say(error.message, true);
    await deleteNewsImage(n.image);
    if (editing === n.id) cancelEdit();
    load();
  }

  if (!user) return null;

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin news">
          <h1 className="rpt__title">Admin: News</h1>
          <p className="rpt__sub">Post news with a photo. Everyone sees it on the News page.</p>

          <form className="rpt-form" onSubmit={save} style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <select className="rtext" value={form.category} onChange={set('category')}>
              {Object.entries(NEWS_CATEGORIES).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
            </select>
            <input className="rtext" placeholder="Headline" value={form.title} onChange={set('title')} />
            <input className="rtext" placeholder="Short summary (shown on the card)" value={form.summary} onChange={set('summary')} />
            <textarea className="rtext" rows={6} placeholder="Full story (one paragraph per line)" value={form.body} onChange={set('body')} />

            <div className="nimg">
              {form.image ? <img src={form.image} alt="Selected news" className="nimg__preview" /> : <p className="nimg__empty">{busy ? 'Uploading…' : 'No photo (optional)'}</p>}
              <div className="nimg__actions">
                <button type="button" className="cmap__btn cmap__btn--primary" disabled={busy} onClick={() => fileRef.current.click()}>
                  {form.image ? 'Change photo' : 'Upload photo'}
                </button>
                {form.image && <button type="button" className="cmap__btn" onClick={() => setForm({ ...form, image: '' })}>Remove</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
            </div>

            <label className="ncheck">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish now (untick to save as a hidden draft)
            </label>

            {msg.text && <p className={msg.bad ? 'rerr' : 'rtoast'} role="status">{msg.text}</p>}
            <button type="submit" className="rpt-publish" disabled={busy}>{editing ? 'Save Changes' : 'Post News'}</button>
            {editing && <button type="button" className="cmap__btn" onClick={cancelEdit}>Cancel editing</button>}
          </form>

          <div className="adm-list">
            {rows.length === 0 && <p className="rempty">No news yet.</p>}
            {rows.map((n) => (
              <article key={n.id} className="adm-row">
                {n.image && <img src={n.image} alt="" className="adm-row__img" />}
                <div className="adm-row__main">
                  <strong>{n.title}</strong>
                  <span>{NEWS_CATEGORIES[n.category]?.label || n.category} · {formatNewsDate(n.createdAt)} · {n.author}</span>
                  <p>{n.summary}</p>
                </div>
                <div className="adm-row__actions">
                  <span className={`rbadge ${n.published ? 'rbadge--resolved' : 'rbadge--pending'}`}>{n.published ? 'Published' : 'Hidden'}</span>
                  <button type="button" className="cmap__btn" onClick={() => startEdit(n)}>Edit</button>
                  <button type="button" className="cmap__btn" onClick={() => togglePublished(n)}>{n.published ? 'Hide' : 'Publish'}</button>
                  <button type="button" className="vlink vlink--cancel" onClick={() => remove(n)}>Delete</button>
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