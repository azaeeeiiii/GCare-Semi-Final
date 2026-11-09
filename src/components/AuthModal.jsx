import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, BellIcon, EyeIcon, GoogleIcon, HazardIcon, LockIcon, MailIcon, PeopleIcon, UserIcon, useDialog,
} from './ui';

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

const labelCls = 'mb-1 mt-2 text-xs font-extrabold';
const linkCls = 'cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-extrabold underline';

function Field({ id, label, icon, invalid, children }) {
  return (
    <>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div
        className={`flex h-[38px] items-center gap-2.5 rounded-full border bg-white px-3 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[#4da3ff] ${
          invalid ? 'border-err' : 'border-navy'
        }`}
      >
        {icon}
        {children}
      </div>
    </>
  );
}

const inputCls =
  'min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-navy outline-0 placeholder:text-[#8b909a]';

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
        className="grid cursor-pointer place-items-center border-0 bg-transparent p-0"
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
      className="mt-1 inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-navy bg-navy text-sm font-extrabold leading-none text-white shadow-[0_6px_14px_rgba(27,36,55,.35)] transition-colors hover:bg-white hover:text-navy active:scale-[.98] motion-reduce:transition-none"
    >
      {children}
      <ArrowRight />
    </button>
  );
}

export default function AuthModal({ tab, onTabChange, onClose, onShowLegal }) {
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

    // TODO: replace with the real sign-in call once the auth provider is chosen
    console.log('Log in:', { email: login.email.trim(), remember: login.remember });
    succeed('Logged in (demo: no backend yet).');
  }

  function submitSignup(e) {
    e.preventDefault();
    if (signup.name.trim().length < 2) return fail('Enter your full name.', 'signName');
    if (!emailOk(signup.email.trim())) return fail('Enter a valid email address.', 'signEmail');
    if (signup.pass.length < 8) return fail('Use at least 8 characters for your password.', 'signPass');
    if (signup.pass !== signup.confirm) return fail('Passwords do not match.', 'signConfirm');
    if (!signup.terms) return fail('Agree to the Terms of Use and Privacy Policy to continue.');

    // TODO: replace with the real sign-up call
    console.log('Sign up:', { name: signup.name.trim(), email: signup.email.trim() });
    succeed('Account created (demo: no backend yet).');
  }

  const err = (
    <p
      role="alert"
      className={`mx-1 mb-0 mt-1.5 min-h-4 text-xs font-bold ${status.ok ? 'text-ok' : 'text-err'}`}
    >
      {status.msg}
    </p>
  );

  const tabBtn = (name, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={active === name}
      onClick={() => onTabChange(name)}
      className={`relative cursor-pointer border-0 bg-transparent py-[9px] text-[13px] font-bold leading-none transition-colors duration-200 motion-reduce:transition-none ${
        active === name ? 'text-white' : 'text-navy'
      }`}
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
      className="m-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] max-w-none overflow-auto rounded-[22px] border-0 bg-white p-0 font-sans text-navy shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop:bg-[rgba(10,15,28,.6)] open:animate-pop motion-reduce:animate-none
        mob:w-[min(940px,calc(100%-32px))] mob:bg-navy"
    >
      <div className="relative grid grid-cols-1 mob:grid-cols-[minmax(340px,400px)_1fr]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-2.5 z-[2] size-9 cursor-pointer rounded-full border-0 bg-card text-2xl leading-none text-navy
            mob:bg-white/[.12] mob:text-white mob:hover:bg-white/25"
        >
          &times;
        </button>

        {/* Left: form card */}
        <section className="rounded-[22px] bg-white px-[26px] pb-5 pt-[26px] mob:rounded-[0_22px_22px_0]">
          <h2 id="authTitle" className="m-0 text-[28px] font-extrabold leading-[1.1]">{COPY[active].title}</h2>
          <p className="mb-4 mt-1 text-[13px]">{COPY[active].sub}</p>

          <div
            role="tablist"
            className="relative mb-3.5 grid grid-cols-2 rounded-full bg-card p-1 shadow-[0_4px_10px_rgba(0,0,0,.12)]"
          >
            <span
              aria-hidden="true"
              className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-navy transition-transform duration-[250ms] ease-in-out motion-reduce:transition-none ${
                isLogin ? '' : 'translate-x-full'
              }`}
            />
            {tabBtn('login', 'Log In')}
            {tabBtn('signup', 'Sign Up')}
          </div>

          {/* LOG IN */}
          {isLogin && (
            <form className="flex flex-col" onSubmit={submitLogin} noValidate>
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

              <div className="mb-0.5 mt-2 flex items-center justify-between text-[11px] font-semibold">
                <label className="flex cursor-pointer items-start gap-1.5 text-[11px] font-semibold">
                  <input
                    type="checkbox"
                    checked={login.remember}
                    onChange={(e) => setLogin({ ...login, remember: e.target.checked })}
                    className="mt-px accent-navy"
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
            <form className="flex flex-col" onSubmit={submitSignup} noValidate>
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

              <label className="mb-0.5 mt-2.5 flex cursor-pointer items-start gap-1.5 text-[11px] font-semibold">
                <input
                  type="checkbox"
                  checked={signup.terms}
                  onChange={(e) => setSignup({ ...signup, terms: e.target.checked })}
                  className="mt-px accent-navy"
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

          <div className="my-2.5 mt-3 flex items-center gap-2.5 text-[11px] font-semibold before:h-px before:flex-1 before:bg-navy before:content-[''] after:h-px after:flex-1 after:bg-navy after:content-['']">
            <span>or continue with</span>
          </div>

          {/* TODO: Google Identity Services / Firebase signInWithPopup */}
          <button
            type="button"
            onClick={() => console.log('Continue with Google clicked')}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-navy bg-white text-sm font-extrabold leading-none text-navy hover:bg-[#f0f0f0]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mb-0 mt-2.5 text-center text-[11px] font-semibold">
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
        <aside className="hidden flex-col justify-center px-9 py-10 text-white mob:flex">
          <h2 className="m-0 text-[clamp(34px,5vw,50px)] font-extrabold leading-[1.05]">Welcome to GCare</h2>
          <p className="mb-3 mt-3.5 text-2xl font-extrabold">
            Your Safety. <em className="not-italic text-gold">Our Community.</em>
          </p>
          <p className="mb-[18px] max-w-[320px] border-b-2 border-gold pb-[18px] text-[15px] leading-[1.4]">
            Stay informed, report emergencies, and connect with your community through GCare.
          </p>
          <ul className="m-0 grid list-none gap-3.5 p-0">
            {[
              { icon: <BellIcon />, title: 'Stay Updated', text: 'Receive important community alerts and safety updates.' },
              { icon: <HazardIcon />, title: 'Report Hazards', text: 'Help your community by reporting incidents and hazards.' },
              { icon: <PeopleIcon />, title: 'Find Help', text: 'Access emergency resources, evacuation centers and community assistance.' },
            ].map((item) => (
              <li key={item.title} className="flex items-center gap-4">
                <span className="grid size-[58px] flex-none place-items-center rounded-full bg-white">{item.icon}</span>
                <div>
                  <strong className="text-[15px]">{item.title}</strong>
                  <p className="m-0 mt-0.5 max-w-[250px] text-xs leading-[1.35]">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </dialog>
  );
}
