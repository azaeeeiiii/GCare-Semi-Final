import { useMemo, useSyncExternalStore } from 'react';

/* ===================== reports.js =====================
   FRONT-END ONLY storage for incident reports (browser localStorage), so the Report page,
   My Reports tab and Feed can be built before a backend exists.

   Status flow:  pending  ->  review  ->  resolved
   Only the ADMIN changes the status (see setReportStatus + pages/Admin.jsx). Users can only view it.

   When the backend is ready, replace addReport(), setReportStatus() and useReports() with API calls.
   ======================================================= */

const KEY = 'gcare_reports';
const CHANGE_EVENT = 'gcare-reports-change';

export const CATEGORIES = [
  { id: 'flood', label: 'Flood', tone: '#2f6f9f' },
  { id: 'fire', label: 'Fire', tone: '#b3401b' },
  { id: 'typhoon', label: 'Typhoon / Strong Wind', tone: '#4a5d7a' },
  { id: 'landslide', label: 'Landslide', tone: '#7a5a2f' },
  { id: 'earthquake', label: 'Earthquake', tone: '#6b4a8a' },
  { id: 'road', label: 'Road Hazard / Closure', tone: '#8a6a2f' },
  { id: 'power', label: 'Power Outage', tone: '#9a7b00' },
  { id: 'water', label: 'Water Interruption', tone: '#2f7d8a' },
  { id: 'medical', label: 'Medical Emergency', tone: '#a00000' },
  { id: 'safety', label: 'Crime / Safety', tone: '#3b4357' },
  { id: 'other', label: 'Other', tone: '#5b6479' },
];

export const STATUS = {
  pending: { label: 'Pending', note: 'Waiting for the admin to pick up your report.' },
  review: { label: 'Under Review', note: 'Our team is checking this report.' },
  resolved: { label: 'Resolved', note: 'The admin marked this report as resolved.' },
};

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const snapshot = () => {
  try {
    return localStorage.getItem(KEY) || '[]';
  } catch {
    return '[]';
  }
};

const subscribe = (cb) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const write = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const read = () => {
  try {
    return JSON.parse(snapshot());
  } catch {
    return [];
  }
};

/* React hook: all reports, newest first. Re-renders whenever a report is added or its status changes. */
export function useReports() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  return useMemo(() => {
    try {
      return JSON.parse(raw).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      return [];
    }
  }, [raw]);
}

export function addReport({ title, category, location, summary, lat, lng, photo, user }) {
  const now = new Date().toISOString();
  const report = {
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    category,
    location: location.trim(),
    summary: summary.trim(),
    photo: photo || '', // data URL for now. TODO backend: store the image on a server and keep its URL here
    lat,
    lng,
    authorName: user.name,
    authorEmail: user.email,
    status: 'pending',
    createdAt: now,
    timeline: [{ status: 'pending', at: now }],
  };
  write([report, ...read()]);
  return report;
}

/* ADMIN ONLY. TODO backend: this must be checked on the server, not in the browser. */
export function setReportStatus(id, status) {
  const now = new Date().toISOString();
  write(
    read().map((r) =>
      r.id === id && r.status !== status ? { ...r, status, timeline: [...r.timeline, { status, at: now }] } : r,
    ),
  );
}

/* ---------- Display helpers ---------- */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const formatDateTime = (iso) =>
  `${formatDate(iso)} • ${new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

/* A report shaped like a feed card / map pin (same fields as newsItems in content.jsx) */
export function toFeedItem(r) {
  const cat = categoryOf(r.category);
  return {
    id: r.id,
    tag: cat.label,
    date: formatDate(r.createdAt),
    title: r.title,
    excerpt: r.summary,
    body: '',
    image: r.photo || '',
    tone: cat.tone,
    location: r.location,
    lat: r.lat,
    lng: r.lng,
    status: r.status,
  };
}