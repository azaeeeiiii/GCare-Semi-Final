import { useSyncExternalStore } from 'react';

/* Volunteer data layer. Uses localStorage for now, same idea as lib/reports.js.
   When Supabase is ready, only the functions in this file change (events + signups tables);
   Volunteer.jsx and Admin.jsx keep calling the same names. */

export const SIGNUP_STATUS = {
  pending: { label: 'Pending', note: 'Waiting for the admin to confirm your slot.' },
  approved: { label: 'Approved', note: 'You are confirmed. See you there!' },
  rejected: { label: 'Not accepted', note: 'This slot is full or no longer available.' },
};

/* Placeholder events. These move to an `events` table (admin creates them). */
export const EVENTS = [
  { id: 'e1', title: 'Relief Goods Packing', location: 'Mars Street, Golden Country Homes', date: '2026-11-18', time: '8:00 AM – 12:00 PM', role: 'Packing Volunteer', slots: 20, summary: 'Pack food, water, and hygiene kits for families affected by disasters.', reminder: 'Wear comfortable clothing and bring a reusable water bottle.' },
  { id: 'e2', title: 'Community Food Drive', location: 'Universe Street', date: '2026-11-20', time: '9:00 AM – 1:00 PM', role: 'Distribution Volunteer', slots: 15, summary: 'Hand out food packs and drinking water to families in need.', reminder: 'Bring a valid ID.' },
  { id: 'e3', title: 'Barangay Clean-Up Drive', location: 'Mercury Street', date: '2026-11-22', time: '7:00 AM – 10:00 AM', role: 'Clean-Up Crew', slots: 30, summary: 'Clean public spaces and keep the community safe and sanitary.', reminder: 'Gloves and trash bags are provided.' },
  { id: 'e4', title: 'First Aid Support Desk', location: 'Venus Street', date: '2026-11-25', time: '8:00 AM – 12:00 PM', role: 'First Aid Assistant', slots: 8, summary: 'Assist the health team with registration and basic first aid.', reminder: 'First aid training is a plus, not required.' },
  { id: 'e5', title: 'Emergency Drill Marshal', location: 'Saturn Street', date: '2026-11-27', time: '2:00 PM – 5:00 PM', role: 'Drill Marshal', slots: 12, summary: 'Guide residents along evacuation routes during the community drill.', reminder: 'Arrive 30 minutes early for the briefing.' },
  { id: 'e6', title: 'Donation Sorting', location: 'Jupiter Street', date: '2026-11-29', time: '9:00 AM – 12:00 PM', role: 'Sorting Volunteer', slots: 18, summary: 'Sort and label donated clothes and supplies for distribution.', reminder: 'Closed shoes are required.' },
];

const KEY = 'gcare.volunteer.signups';
const listeners = new Set();
let cache = null;

function read() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep the in-memory copy */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const useSignups = () => useSyncExternalStore(subscribe, read);

export const eventOf = (id) => EVENTS.find((e) => e.id === id);

export function formatEventDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function signUp(eventId, user) {
  const all = read();
  if (all.some((s) => s.eventId === eventId && s.email === user.email)) return;
  write([...all, { id: `s${Date.now()}`, eventId, email: user.email, name: user.name, status: 'pending', createdAt: new Date().toISOString() }]);
}

export const cancelSignup = (id) => write(read().filter((s) => s.id !== id));

/* Admin: approve or reject a signup */
export const setSignupStatus = (id, status) => write(read().map((s) => (s.id === id ? { ...s, status } : s)));

/* Slots left = capacity minus approved + pending signups */
export const slotsLeft = (event, signups) => Math.max(0, event.slots - signups.filter((s) => s.eventId === event.id && s.status !== 'rejected').length);