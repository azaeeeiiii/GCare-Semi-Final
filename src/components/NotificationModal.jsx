import { useEffect, useState } from 'react';
import { btn, useDialog } from './ui';

const OPTIONS = [
  { key: 'weather', title: 'Weather Alerts', description: 'Rainfall, flooding, and severe weather warnings.' },
  { key: 'emergency', title: 'Emergency Updates', description: 'Important updates from GCare and local authorities.' },
  { key: 'community', title: 'Community Reports', description: 'New incident reports and safety updates near you.' },
  { key: 'volunteer', title: 'Volunteer Opportunities', description: 'Requests for help and community activities.' },
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
