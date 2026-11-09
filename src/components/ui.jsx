import { createContext, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/* ===================== ui.jsx =====================
   Small shared pieces used all over the site:
   icons, button styles, the navy page title band, pop-up + back-button helpers,
   and the links used inside the Terms / Privacy text.
   ================================================== */

/* ---------- ICONS ---------- */
/* All icons as small components so they can be restyled with className */

export const ArrowRight = ({ className = 'size-4 flex-none' }) => (
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

export const ArrowLeft = ({ className = 'size-5' }) => (
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

export const MapPin = ({ className = 'size-[18px]' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" fill="#1b2437" />
    <circle cx="12" cy="9" r="2.6" fill="#fff" />
  </svg>
);

/* Form-field icons (stroke style comes from the field wrapper) */
const field = 'size-5 flex-none fill-none stroke-navy stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]';

export const MailIcon = () => (
  <svg className={field} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const LockIcon = () => (
  <svg className={field} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const UserIcon = () => (
  <svg className={field} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
export const EyeIcon = ({ on }) => (
  <svg
    className={`size-5 fill-none stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round] ${
      on ? 'stroke-gold' : 'stroke-navy'
    }`}
    viewBox="0 0 24 24"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const GoogleIcon = () => (
  <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.3-4 6.8-9.9 6.8-16.9z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.7 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

/* Welcome-panel icons (white circle, navy glyph) */
const side = 'size-[30px] fill-navy stroke-navy stroke-[1.5] [stroke-linejoin:round] [stroke-linecap:round]';

export const BellIcon = () => (
  <svg className={side} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2Z" />
    <path d="M10 21h4" />
  </svg>
);
export const HazardIcon = () => (
  <svg className={side} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17v.5" stroke="#fff" />
  </svg>
);
export const PeopleIcon = () => (
  <svg className={side} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3" />
    <circle cx="5" cy="10" r="2.2" />
    <circle cx="19" cy="10" r="2.2" />
    <path d="M6 20c0-3.5 3-5 6-5s6 1.5 6 5M1 19c0-2.5 2-4 4-4M23 19c0-2.5-2-4-4-4" />
  </svg>
);

/* ---------- BUTTON STYLES ---------- */
/* Pill buttons used across the site. Use with <button>, <a> or <Link>. */
const base =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-transparent px-[18px] py-2 text-sm font-bold leading-none cursor-pointer transition-colors active:scale-[.97] [-webkit-tap-highlight-color:transparent]';

const variants = {
  navy: 'bg-navy text-white hover:border-navy hover:bg-transparent hover:text-navy',
  outlineDark: 'border-navy bg-transparent text-navy hover:bg-navy hover:text-white',
  outlineLight: 'border-white bg-transparent text-white hover:bg-white hover:text-danger',
  white: 'bg-white text-navy hover:bg-[#f0f0f0]',
};

export const btn = (variant = 'navy', extra = '') => `${base} ${variants[variant]} ${extra}`.trim();

/* ---------- PAGE TITLE BAND ---------- */
/* Navy title band used on News / Terms / Privacy */
export function PageHero({ title, children, innerClass = '' }) {
  return (
    <section className="bg-navy px-[clamp(16px,5vw,64px)] pb-[30px] pt-[34px] text-white">
      <div className={`mx-auto max-w-[1040px] ${innerClass}`}>
        <h1 className="m-0 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05]">{title}</h1>
        {children}
      </div>
    </section>
  );
}

/* ---------- HELPERS (hooks) ---------- */

/**
 * Wires a native <dialog> to React state.
 * - `open` true/false -> showModal()/close()
 * - Esc / close() -> calls onClose (so state stays in sync)
 * - Backdrop click closes (but not when a text-selection drag ends outside the card)
 */
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
    onClose, // native "close" event (fires for Esc, form close, el.close())
    onMouseDown: (e) => {
      downOnBackdrop.current = e.target === ref.current;
    },
    onClick: (e) => {
      if (e.target === ref.current && downOnBackdrop.current) onClose();
    },
  };
}


/* Back arrow / "Back to home": go to the previous page if it was on this site,
   otherwise fall back to "/". */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return (e) => {
    e.preventDefault();
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };
}

/* ---------- LINKS INSIDE TERMS / PRIVACY TEXT ---------- */

/* Lets the same legal text work in two places:
   - on the full page   -> real router links
   - inside the pop-up  -> Terms <-> Privacy swap in place */
export const LegalLinkContext = createContext(null); // null = full page, fn(key) = pop-up

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
