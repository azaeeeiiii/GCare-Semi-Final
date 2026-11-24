import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';
import { api } from './api';
import { fileToDataUrl } from './http';

const listeners = new Set();

function readCached() {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (!key) return null;

    const u = JSON.parse(localStorage.getItem(key))?.user;
    if (!u) return null;

    return {
      name: u.user_metadata?.name || '',
      email: u.email,
      isAdmin: localStorage.getItem('gcare_role') === 'admin',
      userType: u.user_metadata?.user_type || '',
      location: u.user_metadata?.location || '',
      avatar: '',
    };
  } catch {
    return null;
  }
}

let current = readCached();

function setCurrent(next) {
  const same =
    (!next && !current) ||
    (next && current && next.email === current.email && next.name === current.name && next.isAdmin === current.isAdmin
      && next.userType === current.userType && next.location === current.location
      && next.avatar === current.avatar);
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

  let data = null;
  let error = null;
  try {
    ({ profile: data } = await api('/me'));
  } catch (err) {
    error = err;
  }


  const role = error || !data
    ? localStorage.getItem('gcare_role') || 'user'
    : data.role || 'user';
  localStorage.setItem('gcare_role', role);

  setCurrent({
    name: data?.name || authUser.user_metadata?.name || current?.name || '',
    email: authUser.email,
    education: data?.education || '',
    location: data?.location || '',
    isAdmin: role === 'admin',
    userType: data?.education || authUser.user_metadata?.user_type || '',
    avatar: data?.avatar_url || current?.avatar || '',
  });
}

let recovering = false;
const recoveryListeners = new Set();

function setRecovering(v) {
  if (recovering === v) return;
  recovering = v;
  recoveryListeners.forEach((l) => l());
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    setRecovering(true);
  }
  setTimeout(() => {
    loadUser(session?.user ?? null);
  }, 0);
});

export function getSession() {
  return current ? current.email : null;
}

/* ---------- SIGN UP ---------- */

export async function signUp({ firstName, lastName, name, email, pass }) {
  const key = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: key,
    password: pass,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: name.trim(),
      },
    },
  });

  const exists = 'An account with this email already exists. Log in instead.';

  if (error) {
    return {
      ok: false,
      field: 'signEmail',
      error: /already/i.test(error.message) ? exists : error.message,
    };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, field: 'signEmail', error: exists };
  }

  if (!data.session) {
    return {
      ok: false,
      pending: true,
      field: 'signEmail',
      error: 'Check your email to confirm your account, then log in.',
    };
  }

  await loadUser(data.user);
  return { ok: true, user: current };
}

/* ---------- LOG IN ---------- */

export async function logIn({ email, pass }) {
  const key = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: key,
    password: pass,
  });

  if (error) {
    const bad = /invalid login/i.test(error.message);
    const unconfirmed = /not confirmed/i.test(error.message);

    return {
      ok: false,
      field: unconfirmed ? 'loginEmail' : 'loginPass',
      error: bad
        ? 'Incorrect email or password.'
        : unconfirmed
          ? 'Please confirm your email first. Check your inbox.'
          : error.message,
    };
  }

  await loadUser(data.user);
  return { ok: true, user: current };
}

/* ---------- LOG OUT ---------- */

export async function logOut() {
  await supabase.auth.signOut();
  setCurrent(null);
}

/* ---------- FORGOT PASSWORD ---------- */

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/` }
  );

  if (error) {
    const limited = /rate limit|seconds/i.test(error.message) || error.status === 429;
    return {
      ok: false,
      error: limited
        ? 'Too many requests. Please wait a minute and try again.'
        : error.message,
    };
  }

  return { ok: true };
}

export async function updateEmail(email) {
  const nextEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.updateUser({ email: nextEmail });
  if (error) return { ok: false, error: error.message };
  await loadUser(data.user);
  return {
    ok: true,
    email: data.user.email,
    confirmationRequired: data.user.email !== nextEmail,
    user: current,
  };
}

export async function deleteAccount() {
  return {
    ok: false,
    error: 'Account deletion is not available yet. Please contact GCare support to delete your account.',
  };
}

/* ---------- COMPLETE PASSWORD RESET ---------- */

export async function completePasswordReset(nextPass) {
  const { error } = await supabase.auth.updateUser({ password: nextPass });

  if (error) {
    const same = /different from the old/i.test(error.message);
    return {
      ok: false,
      error: same ? 'Choose a password you have not used before.' : error.message,
    };
  }

  const { data } = await supabase.auth.getUser();
  await loadUser(data?.user ?? null);

  return { ok: true, user: current };
}

export function finishPasswordRecovery() {
  setRecovering(false);
}

export async function cancelPasswordRecovery() {
  setRecovering(false);
  await logOut();
}

/* ---------- UPDATE PASSWORD ---------- */

export async function updatePassword(currentPass, nextPass) {
  const email = getSession();

  if (!email) {
    return { ok: false, error: 'You are not signed in.' };
  }

  const { error: badCurrent } = await supabase.auth.signInWithPassword({
    email,
    password: currentPass,
  });

  if (badCurrent) {
    return { ok: false, error: 'Current password is incorrect.' };
  }

  const { error } = await supabase.auth.updateUser({ password: nextPass });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/* ---------- UPDATE PROFILE ---------- */

export async function updateProfile({ education, location, userType }) {
  const email = getSession();

  if (!email) {
    return { ok: false, error: 'You are not signed in.' };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return { ok: false, error: 'Unable to get your account.' };
  }

  const user = authData.user;
  const profileType = (userType || education || '').trim();

  let data;
  try {
    ({ profile: data } = await api('/me', {
      method: 'PATCH',
      body: JSON.stringify({ education: profileType, location: (location || '').trim() }),
    }));
  } catch (err) {
    return { ok: false, error: err.message };
  }

  const role = data?.role || 'user';
  localStorage.setItem('gcare_role', role);

  const updatedUser = {
    name: data?.name || user.user_metadata?.name || '',
    email: user.email,
    education: data?.education || '',
    location: data?.location || '',
    userType: data?.education || '',
    isAdmin: role === 'admin',
    avatar: data?.avatar_url || current?.avatar || '',
  };

  setCurrent(updatedUser);

  return { ok: true, user: updatedUser };
}

/* ---------- UPDATE AVATAR ---------- */

export async function updateAvatar(file) {
  try {
    const image = await fileToDataUrl(file);
    const { url } = await api('/me/avatar', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
    setCurrent({ ...current, avatar: url });
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ---------- SUBSCRIPTIONS ---------- */
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const subscribeRecovery = (cb) => {
  recoveryListeners.add(cb);
  return () => recoveryListeners.delete(cb);
};

/* ---------- USER HOOK ---------- */
export function useUser() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/* ---------- PASSWORD RECOVERY HOOK ---------- */

export function usePasswordRecovery(S) {
  return useSyncExternalStore(subscribeRecovery, () => recovering, () => false);
}