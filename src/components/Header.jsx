// Defines GCare's headers, including branding, navigation,
// authentication buttons, and logout functionality.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../lib/auth';
import { STATUS, formatDateTime, useReportsState } from '../lib/reports';
import { ArrowLeft, btn, useDialog, useGoBack } from './ui';

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="GCare home">
      <img src="/images/logo_gcare.jpg" alt="GCare logo" className="brand__logo" />
      <span className="brand__text">
        <span className="brand__name">GCare</span>
        <span className="brand__tagline">Your Safety, Our Community.</span>
      </span>
    </Link>
  );
}

export function SimpleHeader() {
  return (
    <header className="site-header">
      <Brand />
    </header>
  );
}


export function Header({ onOpenAuth }) {
  return (
    <header className="site-header">
      <Brand />
      <nav className="site-header__nav" aria-label="Account">
        <button
          type="button"
          className={btn('outlineDark', 'site-header__btn')}
          onClick={() => onOpenAuth('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={btn('navy', 'site-header__btn')}
          onClick={() => onOpenAuth('signup')}
        >
          Create Account
        </button>
      </nav>
    </header>
  );
}


export function PageHeader() {
  const goBack = useGoBack();
  return (
    <header className="site-header">
      <div className="site-header__left">
        <a
          href="/"
          onClick={goBack}
          aria-label="Go back"
          className="back-link"
        >
          <ArrowLeft />
        </a>
        <Brand />
      </div>
      <Link to="/" onClick={goBack} className={btn('outlineDark', 'site-header__home')}>
        Back to home
      </Link>
    </header>
  );
}


export function FeedHeader({ user }) {
  const navigate = useNavigate();
  const { reports } = useReportsState();
  const [open, setOpen] = useState(false);
  const { ref, onMouseDown, onClick } = useDialog(open, () => setOpen(false));
  const seenKey = `gcare_notifications_seen_${user?.email || 'guest'}`;
  const [seen, setSeen] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(seenKey) || '[]'));
    } catch {
      return new Set();
    }
  });

  const notifications = useMemo(() => reports
    .filter((report) => report.mine)
    .flatMap((report) => (report.timeline || []).map((item) => ({
      id: `${report.id}:${item.status}:${item.at}`,
      reportId: report.id,
      title: report.title,
      status: item.status,
      at: item.at,
    }))), [reports]);

  const unreadCount = notifications.filter((item) => !seen.has(item.id)).length;

  useEffect(() => {
    try {
      setSeen(new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')));
    } catch {
      setSeen(new Set());
    }
  }, [seenKey]);

  function openNotifications() {
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const nextSeen = new Set(seen);
    notifications.forEach((item) => nextSeen.add(item.id));
    setSeen(nextSeen);
    try {
      localStorage.setItem(seenKey, JSON.stringify([...nextSeen]));
    } catch {
    }
  }, [open, seenKey, notifications]);

  return (
    <header className="site-header">
      <Brand />
      <div className="site-header__nav">
        <div className="site-header__account">
          <button
            type="button"
            className="profile-notification-button"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            onClick={openNotifications}
          >
            <img src="/images/bell_icon_circle.png" alt="" />
            {unreadCount > 0 && <span className="profile-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          <span className="site-header__user">{user.name}</span>
        </div>
        <button
          type="button"
          className={btn('outlineDark', 'site-header__btn')}
          onClick={() => {
            logOut();
            navigate('/');
          }}
        >
          Log out
        </button>
      </div>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onMouseDown={onMouseDown}
        onClick={onClick}
        aria-labelledby="notificationsTitle"
        className="profile-notifications-modal"
      >
        <header className="profile-notifications-modal__header">
          <div>
            <h2 id="notificationsTitle">Notifications</h2>
            <p>Updates about your submitted reports.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="profile-notifications-modal__close">&times;</button>
        </header>
        <div className="profile-notifications-modal__body">
          {notifications.length === 0 ? (
            <p className="profile-notifications-empty">You don’t have any report notifications yet.</p>
          ) : (
            [...notifications].sort((a, b) => new Date(b.at) - new Date(a.at)).map((item) => (
              <article className="profile-notification-item" key={item.id}>
                <span className={`profile-notification-item__status profile-notification-item__status--${item.status}`} aria-hidden="true" />
                <div>
                  <strong>
                    {item.status === 'pending'
                      ? 'Report pending'
                      : item.status === 'review'
                        ? 'Report under review'
                        : item.status === 'verified'
                          ? 'Report verified'
                          : item.status === 'resolved'
                            ? 'Report resolved'
                            : 'Report submitted'}
                  </strong>
                  <p>{item.title}</p>
                  <small>{STATUS[item.status]?.note || ''}</small>
                  <time>{formatDateTime(item.at)}</time>
                </div>
              </article>
            ))
          )}
        </div>
      </dialog>
    </header>
  );
}
