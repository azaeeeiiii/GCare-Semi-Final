import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';

/* Supabase Auth. Same exports as before, but signUp, logIn, logOut and updatePassword are async.
   Roles come from the `profiles` table (role = 'user' | 'admin'). */

const listeners = new Set();

// Quick start from the saved session so the page does not flash "logged out" on refresh
function readCached() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) return null;
    const u = JSON.parse(localStorage.getItem(key))?.user;
    if (!u) return null;
    return { name: u.user_metadata?.name || '', email: u.email, isAdmin: localStorage.getItem('gcare_role') === 'admin' };
  } catch {
    return null;
  }
}

let current = readCached();

function setCurrent(next) {
  const same =
    (!next && !current) ||
    (next && current && next.email === current.email && next.name === current.name && next.isAdmin === current.isAdmin);
  if (same) return;
  current = next;
  listeners.forEach((l) => l());
}

async function loadUser(authUser) {
  if (!authUser) {
    localStorage.removeItem('gcare_role');
    setCurrent(null);
    return;
  }
  const { data } = await supabase.from('profiles').select('name, role').eq('id', authUser.id).maybeSingle();
  const role = data?.role || 'user';
  localStorage.setItem('gcare_role', role);
  setCurrent({ name: data?.name || authUser.user_metadata?.name || '', email: authUser.email, isAdmin: role === 'admin' });
}

supabase.auth.onAuthStateChange((_event, session) => {
  setTimeout(() => loadUser(session?.user ?? null), 0);
});

export function getSession() {
  return current ? current.email : null;
}

export async function signUp({ name, email, pass }) {
  const key = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: key,
    password: pass,
    options: { data: { name: name.trim() } },
  });
  const exists = 'An account with this email already exists. Log in instead.';
  if (error) {
    return { ok: false, field: 'signEmail', error: /already/i.test(error.message) ? exists : error.message };
  }
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, field: 'signEmail', error: exists };
  }
  if (!data.session) {
    return { ok: false, field: 'signEmail', error: 'Check your email to confirm your account, then log in.' };
  }
  await loadUser(data.user);
  return { ok: true, user: current };
}

export async function logIn({ email, pass }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
  if (error) {
    const bad = /invalid login/i.test(error.message);
    return { ok: false, field: 'loginPass', error: bad ? 'Incorrect email or password.' : error.message };
  }
  await loadUser(data.user);
  return { ok: true, user: current };
}

export async function logOut() {
  await supabase.auth.signOut();
  setCurrent(null);
}

export async function updatePassword(currentPass, nextPass) {
  const email = getSession();
  if (!email) return { ok: false, error: 'You are not signed in.' };
  const { error: badCurrent } = await supabase.auth.signInWithPassword({ email, password: currentPass });
  if (badCurrent) return { ok: false, error: 'Current password is incorrect.' };
  const { error } = await supabase.auth.updateUser({ password: nextPass });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/* React hook: the current user ({ name, email, isAdmin }) or null when logged out. */
export function useUser() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
