import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import LocationModal from '../components/LocationModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import { logOut, updatePassword, useUser } from '../lib/auth';
import { newsItems } from '../content';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const FeedIcon = () => <svg {...iconProps} className="feed-nav__icon"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ReportIcon = () => <svg {...iconProps} className="feed-nav__icon"><path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V7L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6" /></svg>;
const VolunteerIcon = () => <svg {...iconProps} className="feed-nav__icon"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>;
const ProfileIcon = () => <svg {...iconProps} className="feed-nav__icon"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
const CheckIcon = () => <svg {...iconProps}><path d="m5 12 4 4L19 6" /></svg>;
const LockIcon = () => <svg {...iconProps}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>;
const ShieldIcon = () => <svg {...iconProps}><path d="m12 3 8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" /><path d="m8 12 2.5 2.5L16 9" /></svg>;
const GearIcon = () => <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
const PinIcon = () => <svg {...iconProps}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const BellIcon = () => <svg {...iconProps}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" /></svg>;
const SignOutIcon = () => <svg {...iconProps}><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>;
const ArrowIcon = () => <svg {...iconProps}><path d="m9 6 6 6-6 6" /></svg>;

const NAV = [
  { to: '/feed', label: 'Feed', icon: <FeedIcon /> },
  { to: '/report', label: 'Report', icon: <ReportIcon /> },
  { to: '/volunteer', label: 'Volunteer', icon: <VolunteerIcon /> },
  { to: '/profile', label: 'Profile', icon: <ProfileIcon /> },
];

const reports = [
  { title: 'Massive Flooding in Mars Street', date: 'November 8, 2026 • 02:15 PM', status: 'Under Review', tone: 'review' },
  { title: newsItems[0].title, date: 'November 7, 2026 • 04:32 PM', status: 'Resolved', tone: 'resolved' },
  { title: 'Power Outage', date: 'November 6, 2026 • 08:20 PM', status: 'In Progress', tone: 'progress' },
];

function Avatar({ image, onUpload }) {
  return (
    <div className="profile-avatar-wrap">
      {image ? (
        <img src={image} alt="Your profile" className="profile-avatar profile-avatar--image" />
      ) : (
        <div className="profile-avatar" aria-hidden="true"><span className="profile-avatar__cloud profile-avatar__cloud--one" /><span className="profile-avatar__cloud profile-avatar__cloud--two" /><span className="profile-avatar__hill" /></div>
      )}
      <label className="profile-avatar__upload" title="Change profile photo" aria-label="Change profile photo">
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload} />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 7.5l3 3" />
        </svg>
      </label>
    </div>
  );
}

function PasswordEditor({ onDone }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');

  function submit(e) {
    e.preventDefault();
    if (values.next.length < 8) return setMessage('Use at least 8 characters for your new password.');
    if (values.next !== values.confirm) return setMessage('New passwords do not match.');
    const result = updatePassword(values.current, values.next);
    if (!result.ok) return setMessage(result.error);
    setMessage('Password updated.');
    setValues({ current: '', next: '', confirm: '' });
    setTimeout(onDone, 900);
  }

  return (
    <form className="profile-password" onSubmit={submit}>
      <label>Current password<input type="password" value={values.current} onChange={(e) => setValues({ ...values, current: e.target.value })} required /></label>
      <label>New password<input type="password" value={values.next} onChange={(e) => setValues({ ...values, next: e.target.value })} required /></label>
      <label>Confirm new password<input type="password" value={values.confirm} onChange={(e) => setValues({ ...values, confirm: e.target.value })} required /></label>
      {message && <p className="profile-form-message" role="status">{message}</p>}
      <div className="profile-password__actions"><button type="button" className="profile-button profile-button--quiet" onClick={onDone}>Cancel</button><button type="submit" className="profile-button">Save Password</button></div>
    </form>
  );
}

export default function Profile() {
  const user = useUser();
  const navigate = useNavigate();
  const [otpEnabled, setOtpEnabled] = useState(true);
  const [editingPassword, setEditingPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [locations, setLocations] = useState([{ id: 'home', name: 'Home', address: 'Mars St, Golden Country Homes' }]);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    weather: true,
    emergency: true,
    community: true,
    volunteer: false,
  });

  useEffect(() => {
    document.title = 'Profile – GCare';
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    try {
      setAvatar(localStorage.getItem(`gcare_avatar_${user.email}`) || '');
    } catch {
      setAvatar('');
    }
  }, [user?.email]);

  function uploadAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarMessage('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage('Please choose an image smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      try {
        localStorage.setItem(`gcare_avatar_${user.email}`, image);
        setAvatar(image);
        setAvatarMessage('Profile photo updated.');
      } catch {
        setAvatarMessage('The photo could not be saved. Try a smaller image.');
      }
    };
    reader.onerror = () => setAvatarMessage('The photo could not be uploaded. Try another image.');
    reader.readAsDataURL(file);
  }

  function signOut() {
    logOut();
    navigate('/');
  }

  return (
    <div className="profile-page">
      <FeedHeader user={user} />
      <main className="profile-main">
        <section className="profile-card profile-card--identity">
          <div className="profile-identity">
            <Avatar image={avatar} onUpload={uploadAvatar} />
            <div><h1>{user.name}</h1><p className="profile-email">{user.email}</p><span className="profile-verified"><CheckIcon /> Verified Account</span></div>
          </div>
          {avatarMessage && <p className="profile-form-message" role="status">{avatarMessage}</p>}
          <div className="profile-details">
            <div><strong>▰</strong><span>BS Computer Science<small>BatStateU Alangilan</small></span></div>
            <div><PinIcon /><span>Golden Country Homes<small>Earth</small></span></div>
            <div><strong>▣</strong><span>Joined<small>November 2026</small></span></div>
          </div>
        </section>

        <section className="profile-card profile-card--security">
          <header><h2>Account Security</h2><p>Keep your account safe and secure</p></header>
          {editingPassword ? <PasswordEditor onDone={() => setEditingPassword(false)} /> : <><div className="profile-row"><LockIcon /><div><strong>Password</strong><span>Last updated: November 2, 2026</span></div><button type="button" className="profile-button" onClick={() => setEditingPassword(true)}>Change Password</button></div><div className="profile-row"><ShieldIcon /><div><strong>Two-Factor Authentication (OTP)</strong><span>Add an extra layer of security to your account</span></div><button type="button" className={`profile-switch ${otpEnabled ? 'profile-switch--on' : ''}`} aria-pressed={otpEnabled} onClick={() => setOtpEnabled(!otpEnabled)}><span /></button></div></>}
        </section>

        <section className="profile-card profile-card--reports">
          <header><div><h2>Report History</h2><p>View your submitted reports.</p></div><Link to="/report" className="profile-view-all">View All <ArrowIcon /></Link></header>
          <div className="profile-reports">{reports.map((report) => <div className="profile-report" key={report.title}><div className="profile-report__image"><span className="profile-avatar__cloud profile-avatar__cloud--one" /><span className="profile-avatar__hill" /></div><div className="profile-report__text"><strong>{report.title}</strong><span>{report.date}</span></div><span className={`profile-status profile-status--${report.tone}`}><CheckIcon />{report.status}</span><ArrowIcon /></div>)}</div>
        </section>

        <section className="profile-card profile-card--preferences">
          <header><h2><GearIcon /> Preferences</h2><p>Customize your GCare experience</p></header>
          <div className="profile-row"><PinIcon /><div><strong>Saved Locations</strong><span>{locations[0]?.address || 'No saved locations'}</span></div><button type="button" className="profile-button" onClick={() => setLocationsOpen(true)}>Manage</button></div>
          <div className="profile-row"><BellIcon /><div><strong>Notification Preferences</strong><span>Weather Alerts, Emergency Updates, and more.</span></div><button type="button" className="profile-button" onClick={() => setNotificationsOpen(true)}>Manage</button></div>
          {notice && <p className="profile-form-message" role="status">{notice}</p>}
        </section>

        <section className="profile-card profile-card--signout"><SignOutIcon /><div><strong>Sign Out</strong><span>Log out from your GCare account on this device.</span></div><button type="button" className="profile-button" onClick={() => setSignOutOpen(true)}>Sign Out</button></section>
      </main>
      <LocationModal open={locationsOpen} locations={locations} onChange={setLocations} onClose={() => setLocationsOpen(false)} />
      <NotificationModal open={notificationsOpen} preferences={notificationPreferences} onSave={(next) => { setNotificationPreferences(next); setNotice('Notification preferences updated.'); }} onClose={() => setNotificationsOpen(false)} />
      <ConfirmModal open={signOutOpen} title="Sign out of GCare?" message="You will need to sign in again to access your account on this device." confirmLabel="Sign Out" onConfirm={signOut} onClose={() => setSignOutOpen(false)} />
      <nav className="feed-nav" aria-label="Main">{NAV.map((item) => <Link key={item.to} to={item.to} className="feed-nav__item" aria-current={item.to === '/profile' ? 'page' : undefined}>{item.icon}{item.label}</Link>)}</nav>
    </div>
  );
}
