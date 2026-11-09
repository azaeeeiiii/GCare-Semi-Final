import { Link, useLocation } from 'react-router-dom';

const link = 'hover:underline aria-[current=page]:font-extrabold aria-[current=page]:underline';

export default function Footer() {
  const { pathname } = useLocation();
  const current = (path) => (pathname === path ? 'page' : undefined);

  return (
    <footer className="flex min-h-[52px] flex-wrap items-center justify-between gap-4 bg-white py-1.5 pl-3.5 pr-7 text-xs font-semibold max-[960px]:justify-center max-[960px]:p-3.5 max-[960px]:text-center">
      <nav
        className="ml-auto mr-6 flex flex-wrap items-center gap-6 max-[960px]:m-0 max-[960px]:justify-center max-[960px]:gap-x-5 max-[960px]:gap-y-3.5"
        aria-label="Footer"
      >
        <Link to="/news" className={link} aria-current={current('/news')}>Latest News</Link>
        <Link to="/emergency-resources" className={link}>Emergency Resources</Link>
        <span className="h-6 w-0.5 bg-navy max-[960px]:hidden" aria-hidden="true" />
        <Link to="/about" className={link}>About GCare</Link>
        <Link to="/contact" className={link}>Contact</Link>
        <Link to="/privacy" className={link} aria-current={current('/privacy')}>Privacy Policy</Link>
        <Link to="/terms" className={link} aria-current={current('/terms')}>Terms of Use</Link>
      </nav>

      <small className="text-xs font-semibold">&copy; {new Date().getFullYear()} - GCare</small>
    </footer>
  );
}
