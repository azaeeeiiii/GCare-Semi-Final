import { Link, useLocation } from 'react-router-dom';

const link = 'site-footer__link';

export default function Footer() {
  const { pathname } = useLocation();
  const current = (path) => (pathname === path ? 'page' : undefined);

  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="Footer">
        <span className="site-footer__divider" aria-hidden="true" />
        <Link to="/about" className={link}>About GCare</Link>
        <Link to="/contact" className={link}>Contact</Link>
        <Link to="/privacy" className={link} aria-current={current('/privacy')}>Privacy Policy</Link>
        <Link to="/terms" className={link} aria-current={current('/terms')}>Terms of Use</Link>
      </nav>

      <small className="site-footer__copy">&copy; {new Date().getFullYear()} - GCare</small>
    </footer>
  );
}
