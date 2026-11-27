import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabase';

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
  pending: { label: 'Pending', note: 'Waiting for a volunteer or the admin to pick up your report.' },
  review: { label: 'Under Review', note: 'A volunteer is handling this report.' },
  resolved: { label: 'Resolved', note: 'The report was resolved and verified by the admin.' },
};

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
export const groupOf = (id) => categoryOf(id).group;

async function api(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status}).`);
  return body;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

/* ---------- Store ---------- */
let state = { reports: [], loading: true, error: '' };
const listeners = new Set();
let started = false;

const emit = (next) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

const fromRow = (r, uid) => {
  const timeline = Array.isArray(r.timeline) && r.timeline.length ? r.timeline : [{ status: r.status, at: r.created_at }];
  const resolvedAt = [...timeline].reverse().find((t) => t.status === 'resolved')?.at || null;
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    location: r.location,
    summary: r.summary,
    photo: r.photo_url || '',
    lat: r.lat,
    lng: r.lng,
    authorId: r.author_id,
    authorName: r.author_name || 'Resident',
    mine: !!uid && r.author_id === uid,
    status: r.status,
    createdAt: r.created_at,
    timeline,
    assignedTo: r.assigned_to || null,
    assignedToMe: !!uid && r.assigned_to === uid,
    assignedAt: r.assigned_at || null,
    isAssigned: !!r.is_assigned || !!r.assigned_to,
    proofStatus: r.proof_status || 'none',
    proofUrl: r.proof_url || '',
    proofNote: r.proof_note || '',
    proofSubmittedAt: r.proof_submitted_at || null,
    proofRejectReason: r.proof_reject_reason || '',
    resolvedAt,
  };
};

export async function refreshReports() {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess?.session?.user?.id) {
    emit({ reports: [], loading: false, error: '' });
    return;
  }
  try {
    const { reports, uid } = await api('/api/reports');
    emit({ reports: reports.map((r) => fromRow(r, uid)), loading: false, error: '' });
  } catch {
    emit({ loading: false, error: 'Could not load reports. Please try again.' });
  }
}

function start() {
  if (started) return;
  started = true;
  refreshReports();
  supabase.auth.onAuthStateChange(() => setTimeout(refreshReports, 0));
  window.addEventListener('focus', refreshReports);
  setInterval(refreshReports, 15000);
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

/* ---------- Actions ---------- */
export async function addReport({ title, category, location, summary, lat, lng, photo }) {
  const { id } = await api('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ title, category, location, summary, lat, lng, photo: photo || '' }),
  });
  await refreshReports();
  return { id };
}

export async function setReportStatus(id, status) {
  try {
    await api(`/api/admin/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  } catch (err) {
    console.error('Could not update report:', err.message);
  }
  await refreshReports();
}

export async function deleteReport(id) {
  try {
    await api(`/api/admin/reports/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Could not delete report:', err.message);
  }
  await refreshReports();
}

export async function listVolunteers() {
  try {
    const { rows } = await api('/api/admin/volunteers');
    return { rows };
  } catch (err) {
    return { rows: [], error: err.message };
  }
}

export async function assignReport(id, volunteerId) {
  try {
    await api(`/api/admin/reports/${id}/assign`, { method: 'POST', body: JSON.stringify({ volunteerId }) });
    await refreshReports();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function reviewProof(id, decision, reason = '') {
  try {
    await api(`/api/admin/reports/${id}/proof`, { method: 'POST', body: JSON.stringify({ decision, reason }) });
    await refreshReports();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function claimReport(id) {
  try {
    await api(`/api/assignments/${id}/claim`, { method: 'POST' });
    await refreshReports();
    return { ok: true };
  } catch (err) {
    await refreshReports();
    return { ok: false, error: err.message };
  }
}

export async function submitProof(id, photo, note = '') {
  try {
    await api(`/api/assignments/${id}/proof`, { method: 'POST', body: JSON.stringify({ photo, note }) });
    await refreshReports();
    return { ok: true };
  } catch (err) {
    await refreshReports();
    return { ok: false, error: err.message };
  }
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
  const current = state.reports.find((r) => r.id === id);
  if (!current || !current.mine) throw new Error('You can only delete your own reports.');
  await api(`/api/reports/${id}`, { method: 'DELETE', body: JSON.stringify({ reason, details }) });
  await refreshReports();
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const formatDateTime = (iso) =>
  `${formatDate(iso)} • ${new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

export const DUE_MS = 24 * 60 * 60 * 1000;

export const dueAt = (r) => new Date(new Date(r.assignedAt).getTime() + DUE_MS).toISOString();

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
    proofStatus: r.proofStatus,
    proofUrl: r.proofUrl,
    proofNote: r.proofNote,
    resolvedAt: r.resolvedAt,
  };
}