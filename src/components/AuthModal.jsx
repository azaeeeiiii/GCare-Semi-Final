import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, BellIcon, EyeIcon, GoogleIcon, HazardIcon, LockIcon, MailIcon, PeopleIcon, UserIcon, useDialog,
} from './ui';
import { logIn, signUp } from '../lib/auth';

/* Front-end only for now. Backend hooks are marked TODO. */

const COPY = {
  login: {
    title: 'Welcome Back',
    sub: 'Sign in to continue to your GCare Account',
  },
  signup: {
    title: 'Create your GCare Account',
    sub: 'Join our community for a safer and more prepared tomorrow.',
  },
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const EMPTY_LOGIN = { email: '', pass: '', remember: false };
const EMPTY_SIGNUP = { name: '', email: '', pass: '', confirm: '', terms: false };
const NO_STATUS = { msg: '', ok: false, field: null };

const labelCls = 'auth-label';
const linkCls = 'auth-link';

function Field({ id, label, icon, invalid, children }) {
  return (
    <>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div
        className={`auth-field ${invalid ? 'auth-field--invalid' : ''}`.trim()}
      >
        {icon}
        {children}
      </div>
    </>
  );
}

const inputCls = 'auth-input';

function PassInput({ id, value, onChange, placeholder, autoComplete, shown, onToggle }) {
  return (
    <>
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputCls}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={shown ? 'Hide password' : 'Show password'}
        className="auth-eye"
      >
        <EyeIcon on={shown} />
      </button>
    </>
  );
}

function SubmitButton({ children }) {
  return (
    <button
      type="submit"
      className="auth-submit"
    >
      {children}
      <ArrowRight />
    </button>
  );
}

export default function AuthModal({ tab, onTabChange, onClose, onShowLegal, onAuthed }) {
  const open = tab !== null;
  const active = tab || 'login'; // keep content stable while the dialog is closing
  const isLogin = active === 'login';
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  const [login, setLogin] = useState(EMPTY_LOGIN);
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [shown, setShown] = useState({}); // which password fields are visible
  const [status, setStatus] = useState(NO_STATUS);
  const prevTab = useRef(active);

  // Reset everything when the dialog closes (X, Esc, backdrop or Close)
  useEffect(() => {
    if (!open) {
      setLogin(EMPTY_LOGIN);
      setSignup(EMPTY_SIGNUP);
      setShown({});
      setStatus(NO_STATUS);
    }
  }, [open]);

  // Switching tabs clears messages; focus the first field of the form that appears
  useEffect(() => {
    if (!open) return;
    setStatus(NO_STATUS);
    const id = active === 'signup' ? 'signName' : 'loginEmail';
    requestAnimationFrame(() => document.getElementById(id)?.focus());
    prevTab.current = active;
  }, [active, open]);

  const toggleShown = (key) => setShown((s) => ({ ...s, [key]: !s[key] }));

  function fail(msg, fieldId) {
    setStatus({ msg, ok: false, field: fieldId || null });
    if (fieldId) document.getElementById(fieldId)?.focus();
  }

  const succeed = (msg) => setStatus({ msg, ok: true, field: null });

  function submitLogin(e) {
    e.preventDefault();
    if (!emailOk(login.email.trim())) return fail('Enter a valid email address.', 'loginEmail');
    if (!login.pass) return fail('Enter your password.', 'loginPass');

    // Demo auth (lib/auth.js). TODO: swap for the real sign-in call once the backend exists
    const res = logIn({ email: login.email, pass: login.pass, remember: login.remember });
    if (!res.ok) return fail(res.error, res.field);
    succeed('Logged in. Taking you to the feed…');
    onAuthed?.(res.user);
  }

  function submitSignup(e) {
    e.preventDefault();
    if (signup.name.trim().length < 2) return fail('Enter your full name.', 'signName');
    if (!emailOk(signup.email.trim())) return fail('Enter a valid email address.', 'signEmail');
    if (signup.pass.length < 8) return fail('Use at least 8 characters for your password.', 'signPass');
    if (signup.pass !== signup.confirm) return fail('Passwords do not match.', 'signConfirm');
    if (!signup.terms) return fail('Agree to the Terms of Use and Privacy Policy to continue.');

    // Demo auth (lib/auth.js). TODO: swap for the real sign-up call
    const res = signUp({ name: signup.name, email: signup.email, pass: signup.pass });
    if (!res.ok) return fail(res.error, res.field);
    succeed('Account created. Taking you to the feed…');
    onAuthed?.(res.user);
  }

  const err = (
    <p role="alert" className={`auth-message ${status.ok ? 'auth-message--ok' : 'auth-message--error'}`}>
      {status.msg}
    </p>
  );

  const tabBtn = (name, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={active === name}
      onClick={() => onTabChange(name)}
      className={`auth-tab ${active === name ? 'auth-tab--active' : ''}`.trim()}
    >
      {label}
    </button>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="authTitle"
      className="auth-modal"
    >
      <div className="auth-modal__layout">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="auth-modal__close"
        >
          &times;
        </button>

        {/* Left: form card */}
        <section className="auth-modal__form-card">
          <h2 id="authTitle" className="auth-modal__title">{COPY[active].title}</h2>
          <p className="auth-modal__subtitle">{COPY[active].sub}</p>

          <div role="tablist" className="auth-tabs">
            <span
              aria-hidden="true"
              className={`auth-tabs__slider ${isLogin ? '' : 'auth-tabs__slider--right'}`.trim()}
            />
            {tabBtn('login', 'Log In')}
            {tabBtn('signup', 'Sign Up')}
          </div>

          {/* LOG IN */}
          {isLogin && (
            <form className="auth-form" onSubmit={submitLogin} noValidate>
              <Field id="loginEmail" label="Email Address" icon={<MailIcon />} invalid={status.field === 'loginEmail'}>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field id="loginPass" label="Password" icon={<LockIcon />} invalid={status.field === 'loginPass'}>
                <PassInput
                  id="loginPass"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={login.pass}
                  onChange={(e) => setLogin({ ...login, pass: e.target.value })}
                  shown={!!shown.loginPass}
                  onToggle={() => toggleShown('loginPass')}
                />
              </Field>

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={login.remember}
                    onChange={(e) => setLogin({ ...login, remember: e.target.checked })}
                    className="auth-checkbox"
                  />
                  Remember me
                </label>
                {/* TODO: forgot-password flow */}
                <button type="button" className={linkCls}>Forgot password?</button>
              </div>

              {err}
              <SubmitButton>Log In</SubmitButton>
            </form>
          )}

          {/* SIGN UP */}
          {!isLogin && (
            <form className="auth-form" onSubmit={submitSignup} noValidate>
              <Field id="signName" label="Full Name" icon={<UserIcon />} invalid={status.field === 'signName'}>
                <input
                  id="signName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={signup.name}
                  onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field id="signEmail" label="Email Address" icon={<MailIcon />} invalid={status.field === 'signEmail'}>
                <input
                  id="signEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={signup.email}
                  onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field id="signPass" label="Password" icon={<LockIcon />} invalid={status.field === 'signPass'}>
                <PassInput
                  id="signPass"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={signup.pass}
                  onChange={(e) => setSignup({ ...signup, pass: e.target.value })}
                  shown={!!shown.signPass}
                  onToggle={() => toggleShown('signPass')}
                />
              </Field>

              <Field id="signConfirm" label="Confirm Password" icon={<LockIcon />} invalid={status.field === 'signConfirm'}>
                <PassInput
                  id="signConfirm"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={signup.confirm}
                  onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                  shown={!!shown.signConfirm}
                  onToggle={() => toggleShown('signConfirm')}
                />
              </Field>

              <label className="auth-check auth-check--terms">
                <input
                  type="checkbox"
                  checked={signup.terms}
                  onChange={(e) => setSignup({ ...signup, terms: e.target.checked })}
                  className="auth-checkbox"
                />
                <span>
                  I agree to the GCare{' '}
                  <button type="button" className={linkCls} onClick={() => onShowLegal('terms')}>Terms of Use</button>{' '}
                  and{' '}
                  <button type="button" className={linkCls} onClick={() => onShowLegal('privacy')}>Privacy Policy</button>
                </span>
              </label>

              {err}
              <SubmitButton>Create Account</SubmitButton>
            </form>
          )}

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          {/* TODO: Google Identity Services / Firebase signInWithPopup */}
          <button
            type="button"
            onClick={() => console.log('Continue with Google clicked')}
            className="auth-google"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="auth-switch">
            {isLogin ? (
              <>
                Don&rsquo;t have an account?{' '}
                <button type="button" className={linkCls} onClick={() => onTabChange('signup')}>Create an account</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className={linkCls} onClick={() => onTabChange('login')}>Log in</button>
              </>
            )}
          </p>
        </section>

        {/* Right: welcome panel (hidden on small screens) */}
        <aside className="auth-welcome">
          <h2 className="auth-welcome__title">Welcome to GCare</h2>
          <p className="auth-welcome__tagline">
            Your Safety. <em className="auth-welcome__accent">Our Community.</em>
          </p>
          <p className="auth-welcome__intro">
            Stay informed, report emergencies, and connect with your community through GCare.
          </p>
          <ul className="auth-welcome__list">
            {[
              { icon: <BellIcon />, title: 'Stay Updated', text: 'Receive important community alerts and safety updates.' },
              { icon: <HazardIcon />, title: 'Report Hazards', text: 'Help your community by reporting incidents and hazards.' },
              { icon: <PeopleIcon />, title: 'Find Help', text: 'Access emergency resources, evacuation centers and community assistance.' },
            ].map((item) => (
              <li key={item.title} className="auth-welcome__item">
                <span className="auth-welcome__icon">{item.icon}</span>
                <div>
                  <strong className="auth-welcome__item-title">{item.title}</strong>
                  <p className="auth-welcome__item-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </dialog>
  );
}
