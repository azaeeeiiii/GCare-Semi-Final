import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BellIcon,
  EyeIcon,
  GoogleIcon,
  HazardIcon,
  LockIcon,
  MailIcon,
  PeopleIcon,
  UserIcon,
  useDialog,
} from './ui';

import {
  cancelPasswordRecovery,
  completePasswordReset,
  finishPasswordRecovery,
  logIn,
  sendPasswordReset,
  signUp,
  usePasswordRecovery,
} from '../lib/auth';

const COPY = {
  login: {
    title: 'Welcome Back',
    sub: 'Sign in to continue to your GCare Account',
  },
  signup: {
    title: 'Create your GCare Account',
    sub: 'Join our community for a safer and more prepared tomorrow.',
  },
  forgot: {
    title: 'Forgot Password?',
    sub: 'Enter your email and we will send you a link to reset it.',
  },
  reset: {
    title: 'Set a New Password',
    sub: 'Choose a new password for your GCare Account.',
  },
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const PASTE_MSG =
  'Please type your password again. Pasting is disabled here.';

const EMPTY_LOGIN = {
  email: '',
  pass: '',
};

const EMPTY_SIGNUP = {
  firstName: '',
  lastName: '',
  email: '',
  pass: '',
  confirm: '',
  terms: false,
};

const EMPTY_RESET = {
  pass: '',
  confirm: '',
};

const NO_STATUS = {
  msg: '',
  ok: false,
  field: null,
};

const labelCls = 'auth-label';
const linkCls = 'auth-link';

function Field({ id, label, icon, invalid, children }) {
  return (
    <>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>

      <div
        className={`auth-field ${
          invalid ? 'auth-field--invalid' : ''
        }`.trim()}
      >
        {icon}
        {children}
      </div>
    </>
  );
}

const inputCls = 'auth-input';

function PassInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  shown,
  onToggle,
  noPaste,
  onBlocked,
}) {
  const block = (e) => {
    e.preventDefault();
    onBlocked?.();
  };

  const guards = noPaste
    ? {
        onPaste: block,
        onDrop: block,
        onCopy: block,
        onCut: block,
      }
    : {};

  return (
    <>
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(e) => {
          const kind = e.nativeEvent?.inputType || '';

          if (
            noPaste &&
            (kind === 'insertFromPaste' ||
              kind === 'insertFromDrop')
          ) {
            return onBlocked?.();
          }

          onChange(e);
        }}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputCls}
        {...guards}
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

function SubmitButton({ children, busy }) {
  return (
    <button
      type="submit"
      className="auth-submit"
      disabled={busy}
      style={
        busy
          ? {
              opacity: 0.7,
              cursor: 'wait',
            }
          : undefined
      }
    >
      {children}
      <ArrowRight />
    </button>
  );
}

export default function AuthModal({
  tab,
  onTabChange,
  onClose,
  onShowLegal,
  onAuthed,
}) {
  const open = tab !== null;
  const active = tab || 'login';

  const recovering = usePasswordRecovery();

  const [forgot, setForgot] = useState(false);

  const view = recovering
    ? 'reset'
    : active === 'login' && forgot
      ? 'forgot'
      : active;

  const isLogin = view === 'login';
  const showTabs = view === 'login' || view === 'signup';

  const handleClose = () => {
    if (recovering) {
      cancelPasswordRecovery();
    }

    onClose();
  };

  const { ref, onMouseDown, onClick } = useDialog(
    open,
    handleClose
  );

  const [login, setLogin] = useState(EMPTY_LOGIN);

  const [signup, setSignup] = useState(EMPTY_SIGNUP);

  const [forgotEmail, setForgotEmail] = useState('');

  const [reset, setReset] = useState(EMPTY_RESET);

  const [shown, setShown] = useState({});

  const [status, setStatus] = useState(NO_STATUS);

  const [busy, setBusy] = useState(false);

  const prevTab = useRef(active);

  useEffect(() => {
    if (recovering && tab !== 'login') {
      onTabChange('login');
    }
  }, [recovering, tab, onTabChange]);

  useEffect(() => {
    if (!open) {
      setLogin(EMPTY_LOGIN);
      setSignup(EMPTY_SIGNUP);
      setForgotEmail('');
      setReset(EMPTY_RESET);
      setForgot(false);
      setShown({});
      setStatus(NO_STATUS);
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setStatus(NO_STATUS);

    const ids = {
      signup: 'signFirstName',
      login: 'loginEmail',
      forgot: 'forgotEmail',
      reset: 'resetPass',
    };

    requestAnimationFrame(() => {
      document.getElementById(ids[view])?.focus();
    });

    prevTab.current = active;
  }, [active, open, view]);

  const toggleShown = (key) => {
    setShown((s) => ({
      ...s,
      [key]: !s[key],
    }));
  };

  const goTab = (name) => {
    setForgot(false);
    onTabChange(name);
  };

  function openForgot() {
    if (emailOk(login.email.trim())) {
      setForgotEmail(login.email.trim());
    }

    setForgot(true);
  }

  function fail(msg, fieldId) {
    setStatus({
      msg,
      ok: false,
      field: fieldId || null,
    });

    if (fieldId) {
      document.getElementById(fieldId)?.focus();
    }
  }

  const succeed = (msg) => {
    setStatus({
      msg,
      ok: true,
      field: null,
    });
  };

  async function submitLogin(e) {
    e.preventDefault();

    if (busy) return;

    if (!emailOk(login.email.trim())) {
      return fail(
        'Enter a valid email address.',
        'loginEmail'
      );
    }

    if (!login.pass) {
      return fail(
        'Enter your password.',
        'loginPass'
      );
    }

    setBusy(true);

    const res = await logIn({
      email: login.email,
      pass: login.pass,
    });

    setBusy(false);

    if (!res.ok) {
      return fail(res.error, res.field);
    }

    succeed(
      'Logged in. Taking you to the feed…'
    );

    onAuthed?.(res.user);
  }

  async function submitSignup(e) {
    e.preventDefault();

    if (busy) return;

    const firstName = signup.firstName
      .trim()
      .replace(/\s+/g, ' ');

    const lastName = signup.lastName
      .trim()
      .replace(/\s+/g, ' ');

    if (!firstName) {
      return fail(
        'Enter your first name.',
        'signFirstName'
      );
    }

    if (!lastName) {
      return fail(
        'Enter your last name.',
        'signLastName'
      );
    }

    if (!emailOk(signup.email.trim())) {
      return fail(
        'Enter a valid email address.',
        'signEmail'
      );
    }

    if (signup.pass.length < 8) {
      return fail(
        'Use at least 8 characters for your password.',
        'signPass'
      );
    }

    if (signup.pass !== signup.confirm) {
      return fail(
        'Passwords do not match.',
        'signConfirm'
      );
    }

    if (!signup.terms) {
      return fail(
        'Agree to the Terms of Use and Privacy Policy to continue.'
      );
    }

    const fullName = `${firstName} ${lastName}`;

    setBusy(true);

    const res = await signUp({
      firstName,
      lastName,
      name: fullName,
      email: signup.email,
      pass: signup.pass,
    });

    setBusy(false);

    if (res.pending) {
      return succeed(res.error);
    }

    if (!res.ok) {
      return fail(res.error, res.field);
    }

    succeed(
      'Account created. Taking you to the feed…'
    );

    onAuthed?.(res.user);
  }

  async function submitForgot(e) {
    e.preventDefault();

    if (busy) return;

    if (!emailOk(forgotEmail.trim())) {
      return fail(
        'Enter a valid email address.',
        'forgotEmail'
      );
    }

    setBusy(true);

    const res = await sendPasswordReset(forgotEmail);

    setBusy(false);

    if (!res.ok) {
      return fail(
        res.error,
        'forgotEmail'
      );
    }

    succeed(
      'If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.'
    );
  }

  async function submitReset(e) {
    e.preventDefault();

    if (busy) return;

    if (reset.pass.length < 8) {
      return fail(
        'Use at least 8 characters for your password.',
        'resetPass'
      );
    }

    if (reset.pass !== reset.confirm) {
      return fail(
        'Passwords do not match.',
        'resetConfirm'
      );
    }

    setBusy(true);

    const res = await completePasswordReset(
      reset.pass
    );

    setBusy(false);

    if (!res.ok) {
      return fail(
        res.error,
        'resetPass'
      );
    }

    succeed(
      'Password updated. Taking you to the feed…'
    );

    onAuthed?.(res.user);

    finishPasswordRecovery();
  }

  const err = (
    <p
      role="alert"
      className={`auth-message ${
        status.ok
          ? 'auth-message--ok'
          : 'auth-message--error'
      }`}
    >
      {status.msg}
    </p>
  );

  const tabBtn = (name, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={active === name}
      onClick={() => goTab(name)}
      className={`auth-tab ${
        active === name
          ? 'auth-tab--active'
          : ''
      }`.trim()}
    >
      {label}
    </button>
  );

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="authTitle"
      className="auth-modal"
    >
      <div className="auth-modal__layout">

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="auth-modal__close"
        >
          &times;
        </button>

        <section className="auth-modal__form-card">

          <h2
            id="authTitle"
            className="auth-modal__title"
          >
            {COPY[view].title}
          </h2>

          <p className="auth-modal__subtitle">
            {COPY[view].sub}
          </p>

          {showTabs && (
            <div
              role="tablist"
              className="auth-tabs"
            >
              <span
                aria-hidden="true"
                className={`auth-tabs__slider ${
                  active === 'login'
                    ? ''
                    : 'auth-tabs__slider--right'
                }`.trim()}
              />

              {tabBtn('login', 'Log In')}
              {tabBtn('signup', 'Sign Up')}
            </div>
          )}

          {/* LOG IN */}

          {view === 'login' && (
            <form
              className="auth-form"
              onSubmit={submitLogin}
              noValidate
            >
              <Field
                id="loginEmail"
                label="Email Address"
                icon={<MailIcon />}
                invalid={
                  status.field === 'loginEmail'
                }
              >
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={login.email}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      email: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                id="loginPass"
                label="Password"
                icon={<LockIcon />}
                invalid={
                  status.field === 'loginPass'
                }
              >
                <PassInput
                  id="loginPass"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={login.pass}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      pass: e.target.value,
                    })
                  }
                  shown={!!shown.loginPass}
                  onToggle={() =>
                    toggleShown('loginPass')
                  }
                />
              </Field>

              <div
                className="auth-row"
                style={{
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className={linkCls}
                  onClick={openForgot}
                >
                  Forgot password?
                </button>
              </div>

              {err}

              <SubmitButton busy={busy}>
                Log In
              </SubmitButton>
            </form>
          )}

          {/* SIGN UP */}

          {view === 'signup' && (
            <form
              className="auth-form"
              onSubmit={submitSignup}
              noValidate
            >

              <Field
                id="signFirstName"
                label="First Name"
                icon={<UserIcon />}
                invalid={
                  status.field === 'signFirstName'
                }
              >
                <input
                  id="signFirstName"
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  value={signup.firstName}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      firstName: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                id="signLastName"
                label="Last Name"
                icon={<UserIcon />}
                invalid={
                  status.field === 'signLastName'
                }
              >
                <input
                  id="signLastName"
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  value={signup.lastName}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      lastName: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                id="signEmail"
                label="Email Address"
                icon={<MailIcon />}
                invalid={
                  status.field === 'signEmail'
                }
              >
                <input
                  id="signEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={signup.email}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      email: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                id="signPass"
                label="Password"
                icon={<LockIcon />}
                invalid={
                  status.field === 'signPass'
                }
              >
                <PassInput
                  id="signPass"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={signup.pass}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      pass: e.target.value,
                    })
                  }
                  shown={!!shown.signPass}
                  onToggle={() =>
                    toggleShown('signPass')
                  }
                />
              </Field>

              <Field
                id="signConfirm"
                label="Confirm Password"
                icon={<LockIcon />}
                invalid={
                  status.field === 'signConfirm'
                }
              >
                <PassInput
                  id="signConfirm"
                  placeholder="Type your password again"
                  autoComplete="off"
                  value={signup.confirm}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      confirm: e.target.value,
                    })
                  }
                  shown={!!shown.signConfirm}
                  onToggle={() =>
                    toggleShown('signConfirm')
                  }
                  noPaste
                  onBlocked={() =>
                    fail(
                      PASTE_MSG,
                      'signConfirm'
                    )
                  }
                />
              </Field>

              <label className="auth-check auth-check--terms">
                <input
                  type="checkbox"
                  checked={signup.terms}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      terms: e.target.checked,
                    })
                  }
                  className="auth-checkbox"
                />

                <span>
                  I agree to the GCare{' '}
                  <button
                    type="button"
                    className={linkCls}
                    onClick={() =>
                      onShowLegal('terms')
                    }
                  >
                    Terms of Use
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className={linkCls}
                    onClick={() =>
                      onShowLegal('privacy')
                    }
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>

              {err}

              <SubmitButton busy={busy}>
                Create Account
              </SubmitButton>
            </form>
          )}

          {/* FORGOT PASSWORD */}

          {view === 'forgot' && (
            <form
              className="auth-form"
              onSubmit={submitForgot}
              noValidate
            >
              <Field
                id="forgotEmail"
                label="Email Address"
                icon={<MailIcon />}
                invalid={
                  status.field === 'forgotEmail'
                }
              >
                <input
                  id="forgotEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(e.target.value)
                  }
                  className={inputCls}
                />
              </Field>

              {err}

              <SubmitButton busy={busy}>
                Send Reset Link
              </SubmitButton>

              <p className="auth-switch">
                <button
                  type="button"
                  className={linkCls}
                  onClick={() =>
                    setForgot(false)
                  }
                >
                  Back to log in
                </button>
              </p>
            </form>
          )}

          {/* RESET PASSWORD */}

          {view === 'reset' && (
            <form
              className="auth-form"
              onSubmit={submitReset}
              noValidate
            >
              <Field
                id="resetPass"
                label="New Password"
                icon={<LockIcon />}
                invalid={
                  status.field === 'resetPass'
                }
              >
                <PassInput
                  id="resetPass"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={reset.pass}
                  onChange={(e) =>
                    setReset({
                      ...reset,
                      pass: e.target.value,
                    })
                  }
                  shown={!!shown.resetPass}
                  onToggle={() =>
                    toggleShown('resetPass')
                  }
                />
              </Field>

              <Field
                id="resetConfirm"
                label="Confirm New Password"
                icon={<LockIcon />}
                invalid={
                  status.field === 'resetConfirm'
                }
              >
                <PassInput
                  id="resetConfirm"
                  placeholder="Type your password again"
                  autoComplete="off"
                  value={reset.confirm}
                  onChange={(e) =>
                    setReset({
                      ...reset,
                      confirm: e.target.value,
                    })
                  }
                  shown={!!shown.resetConfirm}
                  onToggle={() =>
                    toggleShown('resetConfirm')
                  }
                  noPaste
                  onBlocked={() =>
                    fail(
                      PASTE_MSG,
                      'resetConfirm'
                    )
                  }
                />
              </Field>

              {err}

              <SubmitButton busy={busy}>
                Update Password
              </SubmitButton>
            </form>
          )}

          {showTabs && (
            <>
              <div className="auth-divider">
                <span>
                  or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  console.log(
                    'Continue with Google clicked'
                  )
                }
                className="auth-google"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="auth-switch">
                {isLogin ? (
                  <>
                    Don&rsquo;t have an account?{' '}
                    <button
                      type="button"
                      className={linkCls}
                      onClick={() =>
                        goTab('signup')
                      }
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className={linkCls}
                      onClick={() =>
                        goTab('login')
                      }
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </section>

        {/* RIGHT WELCOME PANEL */}

        <aside className="auth-welcome">
          <h2 className="auth-welcome__title">
            Welcome to GCare
          </h2>

          <p className="auth-welcome__tagline">
            Your Safety.{' '}
            <em className="auth-welcome__accent">
              Our Community.
            </em>
          </p>

          <p className="auth-welcome__intro">
            Stay informed, report emergencies, and connect
            with your community through GCare.
          </p>

          <ul className="auth-welcome__list">
            {[
              {
                icon: <BellIcon />,
                title: 'Stay Updated',
                text: 'Receive important community alerts and safety updates.',
              },
              {
                icon: <HazardIcon />,
                title: 'Report Hazards',
                text: 'Help your community by reporting incidents and hazards.',
              },
              {
                icon: <PeopleIcon />,
                title: 'Find Help',
                text: 'Access emergency resources, evacuation centers and community assistance.',
              },
            ].map((item) => (
              <li
                key={item.title}
                className="auth-welcome__item"
              >
                <span className="auth-welcome__icon">
                  {item.icon}
                </span>

                <div>
                  <strong className="auth-welcome__item-title">
                    {item.title}
                  </strong>

                  <p className="auth-welcome__item-text">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </dialog>
  );
}