import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';


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
  const [ev, su, tk] = await Promise.all([
    supabase.from('events').select('*').order('event_date', { ascending: true }),
    supabase.from('signups').select('*').order('created_at', { ascending: true }),
    supabase.rpc('signup_counts'),
  ]);

  if (!ev.error && ev.data) {
    EVENTS.length = 0;
    ev.data.forEach((e) =>
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
  }

  signups =
    !su.error && su.data
      ? su.data.map((s) => ({
          id: s.id,
          eventId: s.event_id,
          email: s.email,
          name: s.name,
          status: s.status,
          createdAt: s.created_at,
        }))
      : signups.slice();

  if (!tk.error && tk.data) taken = Object.fromEntries(tk.data.map((r) => [r.event_id, Number(r.taken)]));
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

export async function signUp(eventId, user) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return;
  const { error } = await supabase
    .from('signups')
    .insert({ event_id: eventId, user_id: uid, email: user.email, name: user.name });
  if (error && error.code !== '23505') console.error('signup failed:', error.message);
  await refresh();
}

export async function cancelSignup(id) {
  const { error } = await supabase.from('signups').delete().eq('id', id);
  if (error) console.error('cancel failed:', error.message);
  await refresh();
}

/* Admin: approve or reject a signup */
export async function setSignupStatus(id, status) {
  const { error } = await supabase.from('signups').update({ status }).eq('id', id);
  if (error) console.error('update failed:', error.message);
  await refresh();
}

/* Slots left = capacity minus pending + approved signups (counted for everyone, not just you) */
export const slotsLeft = (event) => Math.max(0, event.slots - (taken[event.id] || 0));
