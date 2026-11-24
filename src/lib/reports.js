import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabase';

export const REPORT_BUCKET = 'report-images';

export const GROUPS = {
  disaster: { label: 'Disaster' },
  risk: { label: 'Risk' },
};

export const CATEGORIES = [
  { id: 'flood', label: 'Flood', tone: '#2f6f9f', group: 'disaster' },
  { id: 'fire', label: 'Fire', tone: '#b3401b', group: 'disaster' },
  { id: 'typhoon', label: 'Typhoon / Strong Wind', tone: '#4a5d7a', group: 'disaster' },
  { id: 'landslide', label: 'Landslide', tone: '#7a5a2f', group: 'disaster' },
  { id: 'earthquake', label: 'Earthquake', tone: '#6b4a8a', group: 'disaster' },
  { id: 'road', label: 'Road Hazard / Closure', tone: '#8a6a2f', group: 'risk' },
  { id: 'power', label: 'Power Outage / Live Wire', tone: '#9a7b00', group: 'risk' },
  { id: 'water', label: 'Water Interruption / Leak', tone: '#2f7d8a', group: 'risk' },
  { id: 'medical', label: 'Medical Emergency', tone: '#a00000', group: 'risk' },
  { id: 'safety', label: 'Crime / Safety', tone: '#3b4357', group: 'risk' },
  { id: 'other', label: 'Other Hazard', tone: '#5b6479', group: 'risk' },
];

export const STATUS = {
  pending: { label: 'Pending', note: 'Waiting for the admin to pick up your report.' },
  review: { label: 'Under Review', note: 'Our team is checking this report.' },
  resolved: { label: 'Resolved', note: 'The admin marked this report as resolved.' },
};

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
export const groupOf = (id) => categoryOf(id).group;

let state = { reports: [], loading: true, error: '' };
const listeners = new Set();
let started = false;

const emit = (next) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

const fromRow = (r, uid) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  location: r.location,
  summary: r.summary,
  photo: r.photo_url || '',
  lat: r.lat,
  lng: r.lng,
  authorName: r.author_name || 'Resident',
  authorId: r.author_id || null,
  mine: !!uid && r.author_id === uid,
  status: r.status,
  createdAt: r.created_at,
  timeline: Array.isArray(r.timeline) && r.timeline.length ? r.timeline : [{ status: r.status, at: r.created_at }],
});

export async function refreshReports() {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess?.session?.user?.id;
  if (!uid) {
    emit({ reports: [], loading: false, error: '' });
    return;
  }
  const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (error) {
    emit({ loading: false, error: 'Could not load reports. Please try again.' });
    return;
  }
  emit({ reports: data.map((r) => fromRow(r, uid)), loading: false, error: '' });
}

function start() {
  if (started) return;
  started = true;
  refreshReports();
  // reload when someone signs in/out
  supabase.auth.onAuthStateChange(() => setTimeout(refreshReports, 0));
  supabase
    .channel('gcare-reports')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => refreshReports())
    .subscribe();
  window.addEventListener('focus', refreshReports);
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getState = () => state;

export function useReportsState() {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useReports() {
  return useReportsState().reports;
}

async function uploadPhoto(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(REPORT_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return supabase.storage.from(REPORT_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function addReport({ title, category, location, summary, lat, lng, photo, user }) {
  const photo_url = await uploadPhoto(photo);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: title.trim(),
      category,
      location: location.trim(),
      summary: summary.trim(),
      photo_url,
      lat,
      lng,
      author_name: user.name,
      status: 'pending',
      timeline: [{ status: 'pending', at: now }],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await refreshReports();
  return { id: data.id };
}

export async function setReportStatus(id, status) {
  const current = state.reports.find((r) => r.id === id);
  if (!current || current.status === status) return;
  const timeline = [...current.timeline, { status, at: new Date().toISOString() }];
  const { error } = await supabase.from('reports').update({ status, timeline }).eq('id', id);
  if (error) console.error('Could not update report:', error.message);
  await refreshReports();
}

export async function deleteReport(id) {
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) console.error('Could not delete report:', error.message);
  await refreshReports();
}
export const DELETE_REASONS = [
  { id: 'typo', label: 'Typo or mistake in the report' },
  { id: 'wrong_location', label: 'Wrong location or pin' },
  { id: 'duplicate', label: 'Duplicate report' },
  { id: 'resolved', label: 'The issue is already resolved' },
  { id: 'accident', label: 'Submitted by accident' },
  { id: 'other', label: 'Other reason' },
];

export async function deleteOwnReport(id, reason, details = '') {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess?.session?.user?.id;
  const current = state.reports.find((r) => r.id === id);
  if (!uid || !current || !current.mine) throw new Error('You can only delete your own reports.');

  const { data, error } = await supabase.from('reports').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Could not delete this report. Please try again.');

  const { error: logError } = await supabase.from('report_deletions').insert({
    report_id: id,
    report_title: current.title,
    category: current.category,
    reason,
    details: details.trim() || null,
  });
  if (logError) console.warn('Could not save the deletion reason:', logError.message);

  await refreshReports();
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const formatDateTime = (iso) =>
  `${formatDate(iso)} • ${new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

export function toFeedItem(r) {
  const cat = categoryOf(r.category);
  return {
    id: r.id,
    tag: cat.label,
    group: cat.group,
    date: formatDate(r.createdAt),
    title: r.title,
    excerpt: r.summary,
    image: r.photo || '',
    tone: cat.tone,
    location: r.location,
    author: r.authorName,
    authorId: r.authorId,
    lat: r.lat,
    lng: r.lng,
    status: r.status,
    createdAt: r.createdAt,
  };
}