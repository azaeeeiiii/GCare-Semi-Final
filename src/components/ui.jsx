// Provides reusable icons, button styles, page layouts, dialog controls, navigation helpers, and legal links.

import { createContext, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const ArrowRight = ({ className = 'arrow-right' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 12h15M13 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ArrowLeft = ({ className = 'arrow-left' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20 12H5M11 6l-6 6 6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MapPin = ({ className = 'map-pin' }) => (
  <img
    className={className}
    src="/images/map_pin.png"
    alt="Location"
  />
);


/* Form-field icons */
const field = 'field-icon';

export const MailIcon = () => (
  <img
    className={field}
    src="/images/mail_icon.png"
    alt=""
    aria-hidden="true"
  />
);

export const LockIcon = () => (
  <img
    className={field}
    src="/images/lock_icon.png"
    alt=""
    aria-hidden="true"
  />
);

export const UserIcon = () => (
  <img
    className={field}
    src="/images/user_icon.png"
    alt=""
    aria-hidden="true"
  />
);

export const EyeIcon = ({ on }) => (
  <svg
    className={`eye-icon ${on ? 'eye-icon--on' : ''}`.trim()}
    viewBox="0 0 24 24"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);


export const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.3-4 6.8-9.9 6.8-16.9z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.7 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const side = 'landing-icon';

export const BellIcon = () => (
  <img
    className={`${side} welcome-icon--image`}
    src="/images/bell_icon_circle.png"
    alt="Notifications"
  />
);
export const HazardIcon = () => (
  <img
    className={`${side} welcome-icon--image`}
    src="/images/hazard_icon_circle.png"
    alt="Hazard warning"
  />
);
export const PeopleIcon = () => (
  <img
    className={`${side} welcome-icon--image`}
    src="/images/people_icon_circle.png"
    alt="People"
  />
);

const variants = {
  navy: 'btn--navy',
  outlineDark: 'btn--outline-dark',
  outlineLight: 'btn--outline-light',
  white: 'btn--white',
};

export const btn = (variant = 'navy', extra = '') => `btn ${variants[variant]} ${extra}`.trim();

export function PageHero({ title, children, innerClass = '' }) {
  return (
    <section className="page-hero">
      <div className={`page-hero__inner ${innerClass}`.trim()}>
        <h1 className="page-hero__title">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function useDialog(open, onClose) {
  const ref = useRef(null);
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return {
    ref,
    onClose, 
    onMouseDown: (e) => {
      downOnBackdrop.current = e.target === ref.current;
    },
    onClick: (e) => {
      if (e.target === ref.current && downOnBackdrop.current) onClose();
    },
  };
}

export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return (e) => {
    e.preventDefault();
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };
}

export const LegalLinkContext = createContext(null); 

const PATHS = { terms: '/terms', privacy: '/privacy' };

export function LegalRef({ to, children }) {
  const swap = useContext(LegalLinkContext);
  if (swap) {
    return (
      <button type="button" className="link-btn" onClick={() => swap(to)}>
        {children}
      </button>
    );
  }
  return <Link to={PATHS[to]}>{children}</Link>;
}

/* Pages that don't exist yet (contact, ...) */
export const ContactLink = ({ children = 'Contact page' }) => <Link to="/contact">{children}</Link>;
