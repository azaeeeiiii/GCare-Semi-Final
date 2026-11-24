import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';
import { api } from './http';

export const SIGNUP_STATUS = {
  pending: { label: 'Pending', note: 'Waiting for the admin to confirm your slot.' },
  approved: { label: 'Approved', note: 'You are confirmed. See you there!' },
  rejected: { label: 'Not accepted', note: 'This slot is full or no longer available.' },
};

export const EVENTS = [];

let signups = [];
let taken = {};
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

export async function refresh() {
  const [evRes, suRes] = await Promise.all([
    api('/api/events').catch(() => null),
    api('/api/signups').catch(() => null), 
  ]);

  if (evRes) {
    EVENTS.length = 0;
    evRes.events.forEach((e) =>
      EVENTS.push({
        id: e.id,
        title: e.title,
        location: e.location,
        date: e.event_date,
        time: e.time_label,
        role: e.role,
        slots: e.slots,
        summary: e.summary,
        reminder: e.reminder,
      }),
    );
    taken = evRes.taken || {};
  }

  signups = suRes
    ? suRes.rows.map((s) => ({
        id: s.id,
        eventId: s.event_id,
        email: s.email,
        name: s.name,
        status: s.status,
        createdAt: s.created_at,
      }))
    : [];

  notify();
}

refresh();
supabase.auth.onAuthStateChange(() => setTimeout(refresh, 0));

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const useSignups = () => useSyncExternalStore(subscribe, () => signups);

export const eventOf = (id) => EVENTS.find((e) => e.id === id);

export function formatEventDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
}

export async function signUp(eventId) {
  try {
    await api('/api/signups', { method: 'POST', body: JSON.stringify({ eventId }) });
  } catch (err) {
    console.error('signup failed:', err.message);
  }
  await refresh();
}

export async function cancelSignup(id) {
  try {
    await api(`/api/signups/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('cancel failed:', err.message);
  }
  await refresh();
}

export async function setSignupStatus(id, status) {
  try {
    await api(`/api/admin/signups/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  } catch (err) {
    console.error('update failed:', err.message);
  }
  await refresh();
}

export async function fetchEventRows() {
  try {
    const { events } = await api('/api/events');
    return events;
  } catch {
    return [];
  }
}

export async function createEvent(payload) {
  try {
    await api('/api/admin/events', { method: 'POST', body: JSON.stringify(payload) });
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function removeEvent(id) {
  try {
    await api(`/api/admin/events/${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export const slotsLeft = (event) => Math.max(0, event.slots - (taken[event.id] || 0));