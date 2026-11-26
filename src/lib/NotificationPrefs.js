// Stores each user's notification preferences so the Profile page and the
// header bell always read the same choices.

import { useCallback, useEffect, useState } from 'react';

export const DEFAULT_NOTIFICATION_PREFS = {
  alerts: true,
  announcements: true,
  community: true,
  newReports: true, 
  volunteer: true,
  verification: true,
};

const EVENT_NAME = 'gcare:notification-prefs';
const keyFor = (email) => `gcare_notification_prefs_${email || 'guest'}`;

export function readNotificationPrefs(email) {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(email)) || 'null');
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export function saveNotificationPrefs(email, prefs) {
  try {
    localStorage.setItem(keyFor(email), JSON.stringify(prefs));
  } catch {
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email } }));
}

export function useNotificationPrefs(email) {
  const [prefs, setPrefs] = useState(() => readNotificationPrefs(email));

  useEffect(() => {
    const sync = () => setPrefs(readNotificationPrefs(email));
    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [email]);

  const update = useCallback((next) => saveNotificationPrefs(email, next), [email]);
  return [prefs, update];
}