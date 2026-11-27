// Lets users customize and save their GCare notification preferences.

import { useEffect, useState } from 'react';
import { btn, useDialog } from './ui';

const OPTIONS = [
  { key: 'alerts', title: 'Alerts', description: 'Alerts & Announcements from the GCare team.' },
  { key: 'announcements', title: 'Announcements', description: 'Announcements from the admin, found in Alerts & Announcements from the GCare team.' },
  { key: 'community', title: 'My Report Updates', description: 'Updates when your report is under review or has been resolved.' },
  // CHANGED wording: now covers both new and resolved reports from other residents
  { key: 'newReports', title: 'Community Report Updates', description: 'Updates when other residents post a new report or when their report has been resolved.' },
  { key: 'volunteer', title: 'Volunteer', description: 'Updates when your volunteer application has been approved.' },
  { key: 'verification', title: 'Profile Verification', description: 'Updates on your profile verification, such as ID verification.' },
];

export default function NotificationModal({ open, preferences, onSave, onClose }) {
  const [draft, setDraft] = useState(preferences);
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  useEffect(() => {
    if (open) setDraft(preferences);
  }, [open, preferences]);

  function save(e) {
    e.preventDefault();
    onSave(draft);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="notificationTitle"
      className="notification-modal"
    >
      <header className="notification-modal__header">
        <div>
          <h2 id="notificationTitle">Notification Preferences</h2>
          <p>Choose which updates you want to receive from GCare.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="notification-modal__close">&times;</button>
      </header>

      <form onSubmit={save}>
        <div className="notification-modal__body">
          {OPTIONS.map((option) => (
            <label className="notification-modal__option" key={option.key}>
              <span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
              <input
                type="checkbox"
                checked={Boolean(draft[option.key])}
                onChange={() => setDraft({ ...draft, [option.key]: !draft[option.key] })}
              />
              <span className="notification-modal__switch" aria-hidden="true"><span /></span>
            </label>
          ))}
        </div>
        <footer className="notification-modal__footer">
          <button type="button" className={btn('outlineDark')} onClick={onClose}>Cancel</button>
          <button type="submit" className={btn('navy')}>Save Preferences</button>
        </footer>
      </form>
    </dialog>
  );
}