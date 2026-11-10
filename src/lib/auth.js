import { useMemo, useSyncExternalStore } from 'react';

/* ===================== auth.js =====================
   FRONT-END ONLY demo auth, so the login gate can be built before a backend exists.
   Accounts + session live in the browser (localStorage / sessionStorage).

   NOT SECURE: passwords are stored as plain text and anyone can edit the browser storage.
   When the backend is ready, replace the bodies of signUp(), logIn() and logOut()
   (and getSession()) with real API calls. The rest of the app only uses these functions.
   =================================================== */

const USERS_KEY = 'gcare_users';
const SESSION_KEY = 'gcare_session';
const CHANGE_EVENT = 'gcare-auth-change';

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

const notify = () => window.dispatchEvent(new Event(CHANGE_EVENT));

/* Returns the logged-in email (string) or null. A primitive so React can compare it cheaply. */
export function getSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

function startSession(email, remember) {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, email);
  notify();
}

export function signUp({ name, email, pass }) {
  const key = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === key)) {
    return { ok: false, field: 'signEmail', error: 'An account with this email already exists. Log in instead.' };
  }
  const user = { name: name.trim(), email: key, pass }; // TODO backend: never store plain passwords
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  startSession(key, true);
  return { ok: true, user };
}

export function logIn({ email, pass, remember }) {
  const key = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === key);
  if (!user) {
    return { ok: false, field: 'loginEmail', error: 'No account found for this email. Create an account first.' };
  }
  if (user.pass !== pass) {
    return { ok: false, field: 'loginPass', error: 'Incorrect password. Try again.' };
  }
  startSession(key, !!remember);
  return { ok: true, user };
}

export function logOut() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  notify();
}

export function updatePassword(currentPass, nextPass) {
  const email = getSession();
  if (!email) return { ok: false, error: 'You are not signed in.' };
  const users = readUsers();
  const index = users.findIndex((u) => u.email === email);
  if (index < 0 || users[index].pass !== currentPass) return { ok: false, error: 'Current password is incorrect.' };
  users[index] = { ...users[index], pass: nextPass };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  notify();
  return { ok: true };
}

const subscribe = (cb) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

/* React hook: the current user ({ name, email }) or null when logged out. */
export function useUser() {
  const email = useSyncExternalStore(subscribe, getSession, () => null);
  return useMemo(() => {
    if (!email) return null;
    const u = readUsers().find((x) => x.email === email);
    return u ? { name: u.name, email: u.email } : null;
  }, [email]);
}
