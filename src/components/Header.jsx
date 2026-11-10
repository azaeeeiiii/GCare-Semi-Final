import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../lib/auth';
import { ArrowLeft, btn, useGoBack } from './ui';

/* Brand logo + the landing header (Sign in / Create Account) + the inner-page header (back arrow) */


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


/* Landing-page header: brand + Sign in / Create Account */
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


/* Inner-page header (news, terms, privacy): back arrow + brand + "Back to home" */
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


/* Feed header: brand + the signed-in user + Log out */
export function FeedHeader({ user }) {
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <Brand />
      <div className="site-header__nav">
        <span className="site-header__user">{user.name}</span>
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
    </header>
  );
}
