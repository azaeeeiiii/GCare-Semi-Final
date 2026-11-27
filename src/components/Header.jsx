// Defines GCare's headers, including branding, navigation,
// authentication buttons, and logout functionality.

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logOut, useUser } from '../lib/auth';
import { STATUS, formatDateTime, useReportsState } from '../lib/reports';
import { useAlerts, ALERT_LEVELS } from '../lib/alerts';
import { useNews } from '../lib/news';
import { eventOf, useSignups } from '../lib/volunteer';
import { getMyVerification } from '../lib/verification';
import { useNotificationPrefs } from '../lib/notificationPrefs';
import { ArrowLeft, btn, useDialog, useGoBack } from './ui';

// How recent a community report (new or resolved) must be to show in the bell,
// and the max number of those notifications shown.
const NEW_REPORT_DAYS = 7;
const MAX_NEW_REPORTS = 20;

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
  const user = useUser();
  const navigate = useNavigate();

  if (user) {
    return (
      <header className="site-header">
        <Brand />
        <nav className="site-header__nav" aria-label="Account">
          <span className="site-header__user">{user.name}</span>
          {user.isAdmin && (
            <Link to="/admin" className={btn('outlineDark', 'site-header__btn')}>
              Admin
            </Link>
          )}
          <button
            type="button"
            className={btn('outlineDark', 'site-header__btn')}
            onClick={() => {
              if (!window.confirm('Log out of GCare?')) return;
              logOut();
              navigate('/');
            }}
          >
            Log out
          </button>
        </nav>
      </header>
    );
  }

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


export function PageHeader({ showHome = false }) {
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
      {showHome && (
        <Link to="/" onClick={goBack} className={btn('outlineDark', 'site-header__home')}>
          Back to home
        </Link>
      )}
    </header>
  );
}


export function FeedHeader({ user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');
  const { reports } = useReportsState();
  const alerts = useAlerts();
  const { news, loading: newsLoading } = useNews();
  const signups = useSignups();
  const [prefs] = useNotificationPrefs(user?.email);
  const [verification, setVerification] = useState(null);
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

  useEffect(() => {
    if (!user?.email) return undefined;
    let alive = true;
    getMyVerification().then(({ row }) => {
      if (alive) setVerification(row);
    });
    return () => { alive = false; };
  }, [user?.email]);

  const notifications = useMemo(() => {
    const items = [];

    // My Report Updates: only when one of YOUR reports is under review or resolved.
    if (prefs.community) {
      reports
        .filter((report) => report.mine)
        .forEach((report) => (report.timeline || []).forEach((item) => {
          if (item.status !== 'review' && item.status !== 'resolved') return;
          items.push({
            id: `report:${report.id}:${item.status}:${item.at}`,
            type: 'community',
            tone: item.status,
            heading: item.status === 'review' ? 'Report under review' : 'Report resolved',
            text: report.title,
            note: STATUS[item.status]?.note || '',
            at: item.at,
            // Opens My Reports with this report selected.
            to: `/report?tab=mine&report=${encodeURIComponent(report.id)}`,
          });
        }));
    }

    // Community Report Updates: other residents' reports (new + resolved).
    if (prefs.newReports) {
      const cutoff = Date.now() - NEW_REPORT_DAYS * 24 * 60 * 60 * 1000;
      const isRecent = (iso) => new Date(iso).getTime() >= cutoff;
      const communityItems = [];

      reports
        .filter((report) => !report.mine)
        .forEach((report) => {
          const link = `/reports?report=${encodeURIComponent(report.id)}`;
          const where = report.location ? ` · ${report.location}` : '';

          // A resident posted a new report.
          if (isRecent(report.createdAt)) {
            communityItems.push({
              id: `newreport:${report.id}`,
              type: 'newReports',
              tone: 'alert',
              heading: 'New community report',
              text: report.title,
              note: `Reported by ${report.authorName}${where}`,
              at: report.createdAt,
              to: link,
            });
          }

          // That report was marked resolved.
          (report.timeline || [])
            .filter((step) => step.status === 'resolved' && isRecent(step.at))
            .forEach((step) => communityItems.push({
              id: `communityresolved:${report.id}:${step.at}`,
              type: 'newReports',
              tone: 'resolved',
              heading: 'Community report resolved',
              text: report.title,
              note: `Reported by ${report.authorName}${where}`,
              at: step.at,
              to: link,
            }));
        });

      communityItems
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, MAX_NEW_REPORTS)
        .forEach((item) => items.push(item));
    }

    // Alerts: active alerts posted by the GCare team.
    if (prefs.alerts) {
      alerts
        .filter((alert) => alert.active)
        .forEach((alert) => items.push({
          id: `alert:${alert.id}`,
          type: 'alerts',
          tone: 'alert',
          heading: `${ALERT_LEVELS[alert.level]?.label || 'New'} alert`,
          text: alert.title,
          note: alert.area,
          at: alert.issuedAt,
          // Opens the Alerts section with this alert expanded.
          to: `/news?alert=${encodeURIComponent(alert.id)}#alerts`,
        }));
    }

    // Announcements: posted by the admin in Alerts & Announcements.
    if (prefs.announcements && !newsLoading) {
      news
        .filter((story) => story.category === 'announcement')
        .forEach((story) => items.push({
          id: `announcement:${story.id}`,
          type: 'announcements',
          tone: 'announcement',
          heading: 'New announcement',
          text: story.title,
          note: story.summary || '',
          at: story.createdAt,
          // Opens the News & Announcements section with this story expanded.
          to: `/news?news=${encodeURIComponent(story.id)}#news`,
        }));
    }

    // Volunteer: only once your volunteer sign-up has been approved.
    if (prefs.volunteer) {
      signups
        .filter((signup) => signup.status === 'approved' && (!signup.email || signup.email === user?.email))
        .forEach((signup) => {
          const event = eventOf(signup.eventId);
          items.push({
            id: `volunteer:${signup.id}:approved`,
            type: 'volunteer',
            tone: 'resolved',
            heading: 'Volunteer application approved',
            text: event?.title || 'Volunteer activity',
            note: 'You are confirmed. See you there!',
            at: signup.createdAt,
            // Opens the Volunteer page on the My Activities tab.
            to: `/volunteer?tab=mine&signup=${encodeURIComponent(signup.id)}`,
          });
        });
    }

    // Profile Verification: ID verification result.
    if (prefs.verification && verification && (verification.status === 'approved' || verification.status === 'rejected')) {
      const approved = verification.status === 'approved';
      items.push({
        id: `verification:${verification.status}:${verification.reviewed_at || verification.created_at || ''}`,
        type: 'verification',
        tone: approved ? 'resolved' : 'rejected',
        heading: approved ? 'ID verified' : 'ID verification rejected',
        text: approved ? 'Your profile is now verified.' : 'Your ID could not be verified.',
        note: approved ? '' : `Reason: ${verification.reject_reason || 'Not specified.'} You can submit again.`,
        at: verification.reviewed_at || verification.created_at || new Date(0).toISOString(),
        // Opens the ID Verification card on the Profile page.
        to: '/profile#verification',
      });
    }

    return items;
  }, [reports, alerts, news, newsLoading, signups, verification, prefs, user?.email]);

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

        {user?.isAdmin && (inAdmin ? (
          <Link to="/feed" className={btn('outlineDark', 'site-header__btn')}>
            Feed
          </Link>
        ) : (
          <Link to="/admin" className={btn('navy', 'site-header__btn')}>
            Admin
          </Link>
        ))}

        <button
          type="button"
          className={btn('outlineDark', 'site-header__btn')}
          onClick={() => {
            if (!window.confirm('Log out of GCare?')) return;
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
            <p>Tap a notification to see the details.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="profile-notifications-modal__close">&times;</button>
        </header>
        <div className="profile-notifications-modal__body">
          {notifications.length === 0 ? (
            <p className="profile-notifications-empty">You don’t have any notifications yet.</p>
          ) : (
            [...notifications].sort((a, b) => new Date(b.at) - new Date(a.at)).map((item) => (
              <Link
                to={item.to}
                key={item.id}
                className="profile-notification-item profile-notification-item--link"
                onClick={() => setOpen(false)}
              >
                <span className={`profile-notification-item__status profile-notification-item__status--${item.tone}`} aria-hidden="true" />
                <div>
                  <strong>{item.heading}</strong>
                  <p>{item.text}</p>
                  {item.note && <small>{item.note}</small>}
                  <time>{formatDateTime(item.at)}</time>
                </div>
                <span className="profile-notification-item__arrow" aria-hidden="true">&rsaquo;</span>
              </Link>
            ))
          )}
        </div>
      </dialog>
    </header>
  );
}