import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const { PORT = 3001, CLIENT_ORIGIN, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } = process.env;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '25mb' }));

const h = (fn) => (req, res, next) => fn(req, res).catch(next);
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const tokenOf = (req) => (req.headers.authorization || '').replace('Bearer ', '');

async function isAdminToken(token) {
  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await asUser.rpc('is_admin');
  return !error && data === true;
}

async function requireUser(req, res, next) {
  try {
    const token = tokenOf(req);
    if (!token) return res.status(401).json({ error: 'Not signed in.' });

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid session.' });

    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}
async function optionalUser(req, res, next) {
  try {
    req.user = null;
    const token = tokenOf(req);
    if (token) {
      const { data } = await admin.auth.getUser(token);
      req.user = data?.user || null;
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function requireAdmin(req, res, next) {
  try {
    const token = tokenOf(req);
    if (!token) return res.status(401).json({ error: 'Not signed in.' });

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid session.' });

    if (!(await isAdminToken(token))) return res.status(403).json({ error: 'Admins only.' });

    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'gcare-server', time: new Date().toISOString() });
});


const CATEGORY_IDS = ['flood', 'fire', 'typhoon', 'landslide', 'earthquake', 'road', 'power', 'water', 'medical', 'safety', 'other'];
const USER_TYPES = ['', 'Student', 'Homeowner / Resident', 'Other'];
const NEWS_CATS = ['update', 'community', 'safety', 'event', 'announcement'];
const ALERT_LEVEL_IDS = ['critical', 'warning', 'advisory'];
const MAX_IMAGE = 5 * 1024 * 1024;

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_IMAGE) throw new Error('Image is too large (max 5 MB).');
  return { type: match[1], buffer, ext: match[1].split('/')[1].replace('jpeg', 'jpg') };
}

async function uploadPublic(bucket, dataUrl, folder = '') {
  const img = parseDataUrl(dataUrl);
  if (!img) return '';
  const path = `${folder}${randomUUID()}.${img.ext}`;
  const { error } = await admin.storage.from(bucket).upload(path, img.buffer, { contentType: img.type });
  if (error) throw new Error(error.message);
  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function uploadPrivate(bucket, img, folder, tag) {
  const path = `${folder}${Date.now()}-${tag}.${img.ext}`;
  const { error } = await admin.storage.from(bucket).upload(path, img.buffer, { contentType: img.type });
  if (error) throw new Error(error.message);
  return path;
}

async function nameOf(user) {
  const { data: prof } = await admin.from('profiles').select('name').eq('id', user.id).maybeSingle();
  return prof?.name || user.user_metadata?.name || '';
}


app.get('/api/alerts', h(async (req, res) => {
  const { data, error } = await admin.from('alerts').select('*').order('issued_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data });
}));

app.get('/api/news', h(async (req, res) => {
  const { data, error } = await admin
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data });
}));

app.get('/api/events', h(async (req, res) => {
  const [ev, su] = await Promise.all([
    admin.from('events').select('*').order('event_date', { ascending: true }),
    admin.from('signups').select('event_id, status'),
  ]);
  if (ev.error) return res.status(500).json({ error: ev.error.message });

  const taken = {};
  (su.data || []).forEach((s) => {
    if (s.status === 'pending' || s.status === 'approved') taken[s.event_id] = (taken[s.event_id] || 0) + 1;
  });
  res.json({ events: ev.data, taken });
}));


app.post('/api/contact', optionalUser, h(async (req, res) => {
  const category = str(req.body?.category, 60);
  const message = str(req.body?.message, 2000);
  if (!category) return res.status(400).json({ error: 'Choose a category.' });
  if (message.length < 3) return res.status(400).json({ error: 'Message is too short.' });

  const email = req.user?.email || str(req.body?.email, 160);
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address so we can reply to you.' });
  }
  const name = req.user ? (await nameOf(req.user)) || str(req.body?.name, 80) : str(req.body?.name, 80);

  const { error } = await admin.from('contact_messages').insert({
    category,
    message,
    author_name: name,
    author_email: email,
    user_id: req.user?.id || null,
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));


app.get('/api/me', requireUser, h(async (req, res) => {
  const { data, error } = await admin
    .from('profiles')
    .select('name, education, location, role, avatar_url')
    .eq('id', req.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data || null });
}));

app.patch('/api/me', requireUser, h(async (req, res) => {
  const education = str(req.body?.education, 60);
  const location = str(req.body?.location, 120);
  if (!USER_TYPES.includes(education)) return res.status(400).json({ error: 'Invalid user type.' });

  const { data, error } = await admin
    .from('profiles')
    .update({ education, location })
    .eq('id', req.user.id)
    .select('name, education, location, role, avatar_url')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
}));

app.post('/api/me/avatar', requireUser, h(async (req, res) => {
  let img;
  try {
    img = parseDataUrl(req.body?.image);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!img) return res.status(400).json({ error: 'Please choose a JPG, PNG, or WEBP image.' });

  const path = `${req.user.id}/${Date.now()}.${img.ext}`;
  const { error: upError } = await admin.storage.from('avatars').upload(path, img.buffer, { contentType: img.type });
  if (upError) return res.status(500).json({ error: upError.message });

  const url = admin.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  const { error } = await admin.from('profiles').update({ avatar_url: url }).eq('id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ url });
}));

app.get('/api/verification/me', requireUser, h(async (req, res) => {
  const { data, error } = await admin
    .from('id_verifications')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ row: data || null });
}));

app.post('/api/verification', requireUser, h(async (req, res) => {
  const { id = '', selfie = '' } = req.body || {};

  const { data: existing } = await admin
    .from('id_verifications')
    .select('status')
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (existing && existing.status !== 'rejected') {
    return res.status(409).json({ error: 'You already have a pending or approved request.' });
  }

  let idImg;
  let selfieImg = null;
  try {
    idImg = parseDataUrl(id);
    if (selfie) selfieImg = parseDataUrl(selfie);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!idImg) return res.status(400).json({ error: 'Please choose a photo of your ID (JPG or PNG).' });
  if (selfie && !selfieImg) return res.status(400).json({ error: 'The selfie must be a JPG or PNG image.' });

  const folder = `${req.user.id}/`;
  const id_path = await uploadPrivate('id-verifications', idImg, folder, 'id');
  const selfie_path = selfieImg ? await uploadPrivate('id-verifications', selfieImg, folder, 'selfie') : null;

  const { data, error } = await admin
    .from('id_verifications')
    .upsert(
      {
        user_id: req.user.id,
        id_path,
        selfie_path,
        status: 'pending',
        reject_reason: null,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ row: data });
}));


app.get('/api/verified', requireUser, h(async (req, res) => {
  const { data, error } = await admin.from('verified_users').select('user_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ids: (data || []).map((r) => r.user_id) });
}));


app.get('/api/reports', requireUser, h(async (req, res) => {
  const { data, error } = await admin.from('reports').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data, uid: req.user.id });
}));

app.post('/api/reports', requireUser, h(async (req, res) => {
  const { title = '', category = '', location = '', summary = '', lat, lng, photo = '' } = req.body || {};

  if (String(title).trim().length < 3) return res.status(400).json({ error: 'Title is too short.' });
  if (!CATEGORY_IDS.includes(category)) return res.status(400).json({ error: 'Invalid category.' });
  if (!String(location).trim()) return res.status(400).json({ error: 'Location is required.' });
  if (String(summary).trim().length < 10) return res.status(400).json({ error: 'Summary is too short.' });
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'Pin the location on the map.' });

  let photo_url = '';
  if (photo) {
    try {
      photo_url = await uploadPublic('report-images', photo);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  const now = new Date().toISOString();

  const { data, error } = await admin
    .from('reports')
    .insert({
      title: str(title, 90),
      category,
      location: str(location, 120),
      summary: str(summary, 600),
      photo_url,
      lat,
      lng,
      author_id: req.user.id,
      author_name: (await nameOf(req.user)) || 'Resident',
      status: 'pending',
      timeline: [{ status: 'pending', at: now }],
    })
    .select('id')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id });
}));

app.delete('/api/reports/:id', requireUser, h(async (req, res) => {
  const { reason = 'other', details = '' } = req.body || {};

  const { data: report, error: findError } = await admin
    .from('reports')
    .select('id, title, category, author_id')
    .eq('id', req.params.id)
    .single();
  if (findError || !report) return res.status(404).json({ error: 'Report not found.' });
  if (report.author_id !== req.user.id) return res.status(403).json({ error: 'You can only delete your own reports.' });

  const { error } = await admin.from('reports').delete().eq('id', report.id);
  if (error) return res.status(500).json({ error: error.message });

  await admin.from('report_deletions').insert({
    report_id: report.id,
    report_title: report.title,
    category: report.category,
    reason: String(reason),
    details: String(details).trim() || null,
  });

  res.json({ ok: true });
}));

app.get('/api/signups', requireUser, h(async (req, res) => {
  const isAdmin = await isAdminToken(req.token);
  let q = admin.from('signups').select('*').order('created_at', { ascending: true });
  if (!isAdmin) q = q.eq('user_id', req.user.id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data });
}));

app.post('/api/signups', requireUser, h(async (req, res) => {
  const eventId = req.body?.eventId;
  if (!eventId) return res.status(400).json({ error: 'Missing event.' });

  const { data: event } = await admin.from('events').select('id, slots').eq('id', eventId).maybeSingle();
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const { count } = await admin
    .from('signups')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .in('status', ['pending', 'approved']);
  if ((count || 0) >= event.slots) return res.status(409).json({ error: 'This slot is already full.' });

  const { error } = await admin.from('signups').insert({
    event_id: eventId,
    user_id: req.user.id,
    email: req.user.email,
    name: await nameOf(req.user),
  });
  if (error && error.code !== '23505') return res.status(500).json({ error: error.message }); // 23505 = nakasign-up na
  res.json({ ok: true });
}));

app.delete('/api/signups/:id', requireUser, h(async (req, res) => {
  const { data: row } = await admin.from('signups').select('id, user_id').eq('id', req.params.id).maybeSingle();
  if (!row) return res.status(404).json({ error: 'Signup not found.' });
  if (row.user_id !== req.user.id && !(await isAdminToken(req.token))) {
    return res.status(403).json({ error: 'You can only cancel your own signup.' });
  }
  const { error } = await admin.from('signups').delete().eq('id', row.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.post('/api/chat', requireUser, h(async (req, res) => {
  const messages = (Array.isArray(req.body?.messages) ? req.body.messages : [])
    .slice(-20)
    .map((m) => ({ role: m.role, text: str(m.text, 500) }));

  const r = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(502).json({ error: 'Chat service failed.' });
  res.json({ reply: data.reply });
}));


app.get('/api/admin/contact', requireAdmin, h(async (req, res) => {
  const { data, error } = await admin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data });
}));

app.patch('/api/admin/contact/:id', requireAdmin, h(async (req, res) => {
  if (typeof req.body?.is_read !== 'boolean') return res.status(400).json({ error: 'Invalid value.' });
  const { data, error } = await admin
    .from('contact_messages')
    .update({ is_read: req.body.is_read })
    .eq('id', req.params.id)
    .select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.status(404).json({ error: 'Message not found.' });
  res.json({ ok: true });
}));

app.get('/api/admin/verifications', requireAdmin, h(async (req, res) => {
  const { data, error } = await admin
    .from('id_verifications')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const ids = data.map((r) => r.user_id);
  let names = {};
  if (ids.length) {
    const { data: profs } = await admin.from('profiles').select('id, name').in('id', ids);
    names = Object.fromEntries((profs || []).map((p) => [p.id, p.name]));
  }
  res.json({ rows: data.map((r) => ({ ...r, name: names[r.user_id] || 'Unknown' })) });
}));

app.get('/api/admin/verifications/image', requireAdmin, h(async (req, res) => {
  const path = String(req.query.path || '');
  if (!path) return res.status(400).json({ error: 'Missing path.' });
  const { data, error } = await admin.storage.from('id-verifications').createSignedUrl(path, 300);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ url: data.signedUrl });
}));

app.post('/api/admin/verifications/:userId/review', requireAdmin, h(async (req, res) => {
  const { status, reason = '' } = req.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { data, error } = await admin
    .from('id_verifications')
    .update({
      status,
      reject_reason: status === 'rejected' ? String(reason).trim() || 'No reason given.' : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id,
    })
    .eq('user_id', req.params.userId)
    .select('user_id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.status(404).json({ error: 'Request not found.' });
  res.json({ ok: true });
}));

app.patch('/api/admin/reports/:id/status', requireAdmin, h(async (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'review', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { data: report, error: findError } = await admin
    .from('reports')
    .select('status, timeline')
    .eq('id', req.params.id)
    .single();
  if (findError || !report) return res.status(404).json({ error: 'Report not found.' });
  if (report.status === status) return res.json({ ok: true });

  const timeline = [...(Array.isArray(report.timeline) ? report.timeline : []), { status, at: new Date().toISOString() }];
  const { error } = await admin.from('reports').update({ status, timeline }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.delete('/api/admin/reports/:id', requireAdmin, h(async (req, res) => {
  const { error } = await admin.from('reports').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.patch('/api/admin/signups/:id', requireAdmin, h(async (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { data, error } = await admin.from('signups').update({ status }).eq('id', req.params.id).select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.status(404).json({ error: 'Signup not found.' });
  res.json({ ok: true });
}));

app.post('/api/admin/events', requireAdmin, h(async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 120);
  const location = str(b.location, 160);
  const time_label = str(b.time_label, 80);
  const role = str(b.role, 80);
  const summary = str(b.summary, 600);
  const reminder = str(b.reminder, 300);
  const event_date = String(b.event_date || '');
  const slots = Number(b.slots);

  if (!title || !location || !time_label || !role || !summary) {
    return res.status(400).json({ error: 'Fill in all fields except the reminder.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date)) return res.status(400).json({ error: 'Choose a valid date.' });
  if (!Number.isInteger(slots) || slots < 1 || slots > 1000) return res.status(400).json({ error: 'Slots must be at least 1.' });

  const { error } = await admin.from('events').insert({ title, location, event_date, time_label, role, slots, summary, reminder });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.delete('/api/admin/events/:id', requireAdmin, h(async (req, res) => {
  await admin.from('signups').delete().eq('event_id', req.params.id);
  const { error } = await admin.from('events').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.post('/api/admin/alerts', requireAdmin, h(async (req, res) => {
  const b = req.body || {};
  const level = String(b.level || '');
  const title = str(b.title, 160);
  const area = str(b.area, 160);
  const body = (Array.isArray(b.body) ? b.body : []).map((s) => str(s, 1000)).filter(Boolean).slice(0, 20);

  if (!ALERT_LEVEL_IDS.includes(level)) return res.status(400).json({ error: 'Invalid alert level.' });
  if (!title || !area || body.length === 0) return res.status(400).json({ error: 'Fill in the title, area and message.' });

  const { error } = await admin.from('alerts').insert({ level, title, area, body });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.patch('/api/admin/alerts/:id', requireAdmin, h(async (req, res) => {
  if (typeof req.body?.active !== 'boolean') return res.status(400).json({ error: 'Invalid value.' });
  const { error } = await admin.from('alerts').update({ active: req.body.active }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.delete('/api/admin/alerts/:id', requireAdmin, h(async (req, res) => {
  const { error } = await admin.from('alerts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));


app.get('/api/admin/news', requireAdmin, h(async (req, res) => {
  const { data, error } = await admin.from('news').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data });
}));

app.post('/api/admin/news/image', requireAdmin, h(async (req, res) => {
  let url;
  try {
    url = await uploadPublic('news-images', req.body?.image);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!url) return res.status(400).json({ error: 'Please choose a JPG, PNG, or WEBP image.' });
  res.json({ url });
}));

app.delete('/api/admin/news/image', requireAdmin, h(async (req, res) => {
  const url = String(req.body?.url || '');
  const marker = '/news-images/';
  const i = url.indexOf(marker);
  if (i === -1) return res.json({ ok: true });
  await admin.storage.from('news-images').remove([url.slice(i + marker.length)]);
  res.json({ ok: true });
}));

function newsFields(b, partial) {
  const out = {};
  if (!partial || b.category !== undefined) out.category = String(b.category || '');
  if (!partial || b.title !== undefined) out.title = str(b.title, 200);
  if (!partial || b.summary !== undefined) out.summary = str(b.summary, 400);
  if (!partial || b.body !== undefined) out.body = str(b.body, 10000);
  if (!partial || b.published !== undefined) out.published = b.published === true;
  if (!partial || b.image_url !== undefined) {
    const url = String(b.image_url || '');
    out.image_url = url && url.startsWith(SUPABASE_URL) ? url : null;
  }
  return out;
}

app.post('/api/admin/news', requireAdmin, h(async (req, res) => {
  const f = newsFields(req.body || {}, false);
  if (!NEWS_CATS.includes(f.category)) return res.status(400).json({ error: 'Invalid category.' });
  if (!f.title || !f.summary || !f.body) return res.status(400).json({ error: 'Fill in the title, short summary and full story.' });

  const { error } = await admin.from('news').insert({ ...f, author: (await nameOf(req.user)) || 'GCare Team' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.patch('/api/admin/news/:id', requireAdmin, h(async (req, res) => {
  const f = newsFields(req.body || {}, true);
  if (f.category !== undefined && !NEWS_CATS.includes(f.category)) return res.status(400).json({ error: 'Invalid category.' });
  if (Object.keys(f).length === 0) return res.status(400).json({ error: 'Nothing to update.' });

  const { error } = await admin.from('news').update(f).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.delete('/api/admin/news/:id', requireAdmin, h(async (req, res) => {
  const { error } = await admin.from('news').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`GCare server running on http://localhost:${PORT}`);
});