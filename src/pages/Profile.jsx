import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import LocationModal from '../components/LocationModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import IdVerification from '../components/IdVerification';
import { MyVerifiedBadge } from '../components/VerifiedBadge';
import { deleteAccount, logOut, updateAvatar, updateEmail, updatePassword, updateProfile, useUser } from '../lib/auth';
import { STATUS, formatDateTime, useReportsState } from '../lib/reports';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const navImg = (file) => <img src={`/images/${file}`} alt="" aria-hidden="true" className="feed-nav__icon feed-nav__icon--img" />;
const FeedIcon = () => navImg('feed_icon.png');
const ReportIcon = () => navImg('report_icon.png');
const VolunteerIcon = () => navImg('volunteer_icon.png');
const ProfileIcon = () => navImg('profile_icon.png');
const CheckIcon = () => <svg {...iconProps}><path d="m5 12 4 4L19 6" /></svg>;
const LockIcon = () => <svg {...iconProps}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>;
const MailIcon = () => <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
const GearIcon = () => <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
const PinIcon = () => <svg {...iconProps}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const BellIcon = () => <svg {...iconProps}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" /></svg>;
const SignOutIcon = () => <svg {...iconProps}><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>;
const TrashIcon = () => <svg {...iconProps}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>;
const ArrowIcon = () => <svg {...iconProps}><path d="m9 6 6 6-6 6" /></svg>;

const NAV = [
  { to: '/feed', label: 'Feed', icon: <FeedIcon /> },
  { to: '/report', label: 'Report', icon: <ReportIcon /> },
  { to: '/volunteer', label: 'Volunteer', icon: <VolunteerIcon /> },
  { to: '/profile', label: 'Profile', icon: <ProfileIcon /> },
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

  async function submit(e) {
    e.preventDefault();
    if (values.next.length < 8) return setMessage('Use at least 8 characters for your new password.');
    if (values.next !== values.confirm) return setMessage('New passwords do not match.');
    const result = await updatePassword(values.current, values.next);
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

function ProfileSetup({ initialValues, onSaved }) {
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!values.userType.trim() || !values.location.trim()) {
      setMessage('Choose your user type and add your location to finish setting up your profile.');
      return;
    }

    setSaving(true);
    setMessage('');
    const result = await updateProfile(values);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    onSaved(result.user);
  }

  return (
    <form className="profile-setup" onSubmit={submit}>
      <div className="profile-setup__heading">
        <div><h2>Finish setting up your profile</h2><p>Add a few details so your profile is complete.</p></div>
      </div>
      <div className="profile-setup__fields">
        <label>User Type<select value={values.userType} onChange={(e) => setValues({ ...values, userType: e.target.value })} required><option value="" disabled>Select your user type</option><option>Student</option><option>Homeowner / Resident</option><option>Other</option></select></label>
        <label>Location<input type="text" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} placeholder="Your location" required /></label>
      </div>
      {message && <p className="profile-form-message profile-form-message--error" role="alert">{message}</p>}
      <button type="submit" className="profile-button profile-button--primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
    </form>
  );
}

function EmailEditor({ currentEmail, onDone }) {
  const [values, setValues] = useState({ email: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const email = values.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage('Enter a valid email address.');
    if (email === currentEmail.toLowerCase()) return setMessage('Enter a different email address.');
    if (email !== values.confirm.trim().toLowerCase()) return setMessage('Email addresses do not match.');

    setSaving(true);
    setMessage('');
    const result = await updateEmail(email);
    setSaving(false);
    if (!result.ok) return setMessage(result.error);
    setMessage(result.confirmationRequired
      ? 'Confirmation email sent. Your email will update after you confirm it.'
      : 'Email updated.');
    setValues({ email: '', confirm: '' });
    setTimeout(onDone, 1800);
  }

  return (
    <form className="profile-password" onSubmit={submit}>
      <label>New email<input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} autoComplete="email" required /></label>
      <label>Confirm new email<input type="email" value={values.confirm} onChange={(e) => setValues({ ...values, confirm: e.target.value })} autoComplete="email" required /></label>
      {message && <p className="profile-form-message" role="status">{message}</p>}
      <div className="profile-password__actions"><button type="button" className="profile-button profile-button--quiet" onClick={onDone}>Cancel</button><button type="submit" className="profile-button" disabled={saving}>{saving ? 'Saving...' : 'Save Email'}</button></div>
    </form>
  );
}

export default function Profile() {
  const user = useUser();
  const navigate = useNavigate();
  const { reports: allReports, loading: reportsLoading, error: reportsError } = useReportsState();
  const mineReports = allReports.filter((report) => report.mine).slice(0, 3);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [notice, setNotice] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    weather: true,
    emergency: true,
    community: true,
    volunteer: false,
  });

  const avatar = user?.avatar || '';

  useEffect(() => {
    document.title = 'Profile – GCare';
  }, []);

  async function uploadAvatar(e) {
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
    setAvatarMessage('Uploading...');
    const result = await updateAvatar(file);
    setAvatarMessage(result.ok ? 'Profile photo updated.' : result.error);
  }

  function signOut() {
    logOut();
    navigate('/');
  }

  async function removeAccount() {
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }
    setDeleteOpen(false);
  }

  return (
    <div className="profile-page">
      <FeedHeader user={user} />
      <main className="profile-main">
        <div className="profile-column profile-column--left">
        <section className="profile-card profile-card--identity">
          <div className="profile-identity">
            <Avatar image={avatar} onUpload={uploadAvatar} />
            <div><h1>{user.name}<MyVerifiedBadge size={26} /></h1><p className="profile-email">{user.email}</p></div>
          </div>
          {avatarMessage && <p className="profile-form-message" role="status">{avatarMessage}</p>}
          {editingProfile || !user.userType || !user.location ? (
            <ProfileSetup
              initialValues={{ userType: user.userType || '', location: user.location || '' }}
              onSaved={() => setEditingProfile(false)}
            />
          ) : (
            <div className="profile-details">
              <div><strong>▰</strong><span>{user.userType}</span></div>
              <div><PinIcon /><span>{user.location}</span></div>
              <button type="button" className="profile-button profile-button--quiet" onClick={() => setEditingProfile(true)}>Edit</button>
            </div>
          )}
        </section>

        <IdVerification />

        <section className="profile-card profile-card--reports">
          <header><div><h2>Report History</h2><p>View your submitted reports.</p></div><Link to="/report" className="profile-view-all">View All <ArrowIcon /></Link></header>
          <div className="profile-reports">
            {reportsLoading && <p className="profile-report-empty">Loading reports...</p>}
            {!reportsLoading && reportsError && <p className="profile-report-empty">{reportsError}</p>}
            {!reportsLoading && !reportsError && mineReports.length === 0 && (
              <p className="profile-report-empty">You haven’t submitted any reports yet.</p>
            )}
            {!reportsLoading && !reportsError && mineReports.map((report) => {
              const statusTone = report.status === 'pending' ? 'pending' : report.status === 'resolved' ? 'resolved' : 'review';
              return (
                <Link
                  className="profile-report"
                  to={`/report?tab=mine&report=${encodeURIComponent(report.id)}`}
                  key={report.id}
                  aria-label={`View ${report.title} in My Reports`}
                >
                  <div className="profile-report__image">
                    {report.photo ? (
                      <img src={report.photo} alt="" className="profile-report__photo" />
                    ) : (
                      <><span className="profile-avatar__cloud profile-avatar__cloud--one" /><span className="profile-avatar__hill" /></>
                    )}
                  </div>
                  <div className="profile-report__text"><strong>{report.title}</strong><span>{formatDateTime(report.createdAt)}</span></div>
                  <span className={`profile-status profile-status--${statusTone}`}><CheckIcon />{STATUS[report.status]?.label || report.status}</span><ArrowIcon />
                </Link>
              );
            })}
          </div>
        </section>
        </div>

        <div className="profile-column profile-column--right">
        <section className="profile-card profile-card--security">
          <header><h2>Account Security</h2><p>Keep your account safe and secure</p></header>
          {editingPassword ? <PasswordEditor onDone={() => setEditingPassword(false)} /> : editingEmail ? <EmailEditor currentEmail={user.email} onDone={() => setEditingEmail(false)} /> : <><div className="profile-row"><LockIcon /><div><strong>Password</strong><span>Last updated: November 2, 2026</span></div><button type="button" className="profile-button" onClick={() => setEditingPassword(true)}>Change Password</button></div><div className="profile-row"><MailIcon /><div><strong>Email</strong><span>Current email: {user.email}</span></div><button type="button" className="profile-button" onClick={() => setEditingEmail(true)}>Change Email</button></div></>}
        </section>

        <section className="profile-card profile-card--preferences">
          <header><h2><GearIcon /> Preferences</h2><p>Customize your GCare experience</p></header>
          <div className="profile-row"><PinIcon /><div><strong>Saved Locations</strong><span>{locations[0]?.address || 'No saved locations'}</span></div><button type="button" className="profile-button" onClick={() => setLocationsOpen(true)}>Manage</button></div>
          <div className="profile-row"><BellIcon /><div><strong>Notification Preferences</strong><span>Weather Alerts, Emergency Updates, and more.</span></div><button type="button" className="profile-button" onClick={() => setNotificationsOpen(true)}>Manage</button></div>
          {notice && <p className="profile-form-message" role="status">{notice}</p>}
        </section>

        <section className="profile-card profile-card--danger"><TrashIcon /><div><strong>Delete Account</strong><span>Permanently delete your GCare account and associated profile data.</span></div><button type="button" className="profile-button" onClick={() => { setDeleteError(''); setDeleteOpen(true); }}>Delete Account</button></section>
        <section className="profile-card profile-card--signout"><SignOutIcon /><div><strong>Sign Out</strong><span>Log out from your GCare account on this device.</span></div><button type="button" className="profile-button" onClick={() => setSignOutOpen(true)}>Sign Out</button></section>
        </div>
      </main>
      <LocationModal open={locationsOpen} locations={locations} onChange={setLocations} onClose={() => setLocationsOpen(false)} />
      <NotificationModal open={notificationsOpen} preferences={notificationPreferences} onSave={(next) => { setNotificationPreferences(next); setNotice('Notification preferences updated.'); }} onClose={() => setNotificationsOpen(false)} />
      <ConfirmModal open={signOutOpen} title="Sign out of GCare?" message="You will need to sign in again to access your account on this device." confirmLabel="Sign Out" onConfirm={signOut} onClose={() => setSignOutOpen(false)} />
      <ConfirmModal open={deleteOpen} title="Delete your account?" message="This action is permanent and cannot be undone." confirmLabel="Delete Account" onConfirm={removeAccount} onClose={() => setDeleteOpen(false)} error={deleteError} confirmDisabled={deleting} />
      <nav className="feed-nav" aria-label="Main">{NAV.map((item) => <Link key={item.to} to={item.to} className="feed-nav__item" aria-current={item.to === '/profile' ? 'page' : undefined}>{item.icon}{item.label}</Link>)}</nav>
    </div>
  );
}