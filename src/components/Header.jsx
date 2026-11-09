import { Link } from 'react-router-dom';
import { ArrowLeft, btn, useGoBack } from './ui';

/* Brand logo + the landing header (Sign in / Create Account) + the inner-page header (back arrow) */


function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="GCare home">
      <img src="/images/logo_gcare.jpg" alt="GCare logo" className="size-[38px] object-contain" />
      <span className="flex flex-col leading-none">
        <span className="text-[26px] font-extrabold tracking-[.2px] max-[640px]:text-[22px]">GCare</span>
        <span className="mt-px text-[11px] font-semibold max-[640px]:hidden">Your Safety, Our Community.</span>
      </span>
    </Link>
  );
}


/* Landing-page header: brand + Sign in / Create Account */
export function Header({ onOpenAuth }) {
  return (
    <header className="flex h-[58px] items-center justify-between bg-white pl-7 pr-6 max-[640px]:px-3">
      <Brand />
      <nav className="flex gap-3.5 max-[640px]:gap-2" aria-label="Account">
        <button
          type="button"
          className={btn('outlineDark', 'max-[640px]:px-3 max-[640px]:text-[13px]')}
          onClick={() => onOpenAuth('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={btn('navy', 'max-[640px]:px-3 max-[640px]:text-[13px]')}
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
    <header className="flex h-[58px] items-center justify-between bg-white pl-7 pr-6 max-[640px]:px-3">
      <div className="flex items-center gap-3">
        <a
          href="/"
          onClick={goBack}
          aria-label="Go back"
          className="grid size-[38px] flex-none place-items-center rounded-full border-[1.5px] border-navy text-navy transition-colors hover:bg-navy hover:text-white active:scale-[.94]"
        >
          <ArrowLeft />
        </a>
        <Brand />
      </div>
      <Link to="/" onClick={goBack} className={btn('outlineDark', 'max-[480px]:hidden')}>
        Back to home
      </Link>
    </header>
  );
}
