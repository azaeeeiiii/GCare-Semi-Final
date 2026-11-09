import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { AlertBanner, AlertModal } from '../components/Alerts';
import AuthModal from '../components/AuthModal';
import { LegalModal } from '../components/LegalModal';
import { ArrowRight, MapPin, btn } from '../components/ui';
import { activeAlert, areaStatus } from '../content';

export default function Landing() {
  const { hash } = useLocation();
  const [alertOpen, setAlertOpen] = useState(false);
  const [authTab, setAuthTab] = useState(null); // null = closed, 'login' | 'signup' = open
  const [legalKey, setLegalKey] = useState(null); // null | 'terms' | 'privacy'

  // Optional deep links: /#signup  /#signin  /#login
  useEffect(() => {
    if (hash === '#signup') setAuthTab('signup');
    else if (hash === '#signin' || hash === '#login') setAuthTab('login');
  }, [hash]);

  return (
    <>
      <Header onOpenAuth={setAuthTab} />

      {/* ===== HERO ===== */}
      <main
        className="relative grid min-h-[calc(100svh-110px)] grid-cols-1 gap-6 overflow-hidden bg-navy px-5 pb-10 pt-[18px] text-white
          mob:grid-cols-[1fr_auto] mob:grid-rows-[auto_1fr_auto] mob:gap-[18px] mob:px-[clamp(12px,1.6vw,32px)] mob:pb-4 mob:pt-[22px]"
      >
        {/* Background photo (fades in from the left on desktop, full-bleed + dark overlay on mobile) */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 z-0 w-full bg-[url('/images/landing_bg.jpg')] bg-cover bg-[70%_center] bg-no-repeat
            mob:w-[62%] mob:bg-center mob:[-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_38%)] mob:[mask-image:linear-gradient(90deg,transparent_0%,#000_38%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-gradient-to-b from-navy/90 via-navy/[.72] to-navy/90 mob:hidden"
        />

        <AlertBanner alert={activeAlert} onViewDetails={() => setAlertOpen(true)} />

        {/* Headline + status */}
        <div className="relative z-[1] self-start pl-1 pt-[clamp(4px,3vh,36px)] max-[760px]:pl-0 max-[760px]:pt-1">
          <h1 className="m-0 text-[clamp(38px,11vw,52px)] font-bold leading-[1.04] tracking-[-.5px] mob:text-[clamp(42px,5.6vw,96px)]">
            Stay Informed.<br />
            Stay Prepared.<br />
            Stay Safe.
          </h1>

          <p className="mt-[18px] flex flex-wrap items-center gap-1.5 text-[clamp(12.5px,1vw,15px)] font-semibold">
            <span className="size-[9px] rounded-full bg-live" aria-hidden="true" />
            <span>{areaStatus.text}</span>
            &bull; Updated:
            <time className="whitespace-nowrap">{areaStatus.updated}</time>
          </p>
        </div>

        {/* Explore map */}
        <Link
          to="/feed"
          className={btn(
            'white',
            'relative z-[1] justify-self-start !px-[18px] !py-3 mob:mr-[clamp(8px,1.5vw,28px)] mob:self-center mob:justify-self-auto'
          )}
        >
          <MapPin />
          Explore Safety Map
          <ArrowRight />
        </Link>

        {/* Community card */}
        <section
          aria-labelledby="communityTitle"
          className="relative z-[1] mb-[clamp(20px,6vh,64px)] flex w-full flex-col items-start gap-2.5 overflow-hidden rounded-xl bg-[#f0f0ef] p-4 text-navy
            mob:col-span-2 mob:min-h-[120px] mob:w-[min(100%,520px)] mob:flex-row mob:items-center mob:justify-self-start mob:gap-0 mob:overflow-visible mob:py-3.5 mob:pl-[132px] mob:pr-[18px]"
        >
          <img
            src="/images/person_landing.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none relative z-[2] block h-auto w-[76px] flex-none self-start object-contain object-bottom
              mob:absolute mob:bottom-0 mob:left-[18px] mob:h-[140px] mob:w-[110px] mob:self-auto"
          />

          <div className="relative z-[1] w-full">
            <h2
              id="communityTitle"
              className="m-0 mb-1 text-[22px] font-extrabold leading-[1.1] mob:whitespace-nowrap mob:text-[25px]"
            >
              Be Part of a Safer Community
            </h2>
            <p className="m-0 mb-3 text-[13px] leading-[1.3] mob:text-[12.5px]">
              Help keep your community informed by reporting hazards, sharing verified information, or volunteering
              during emergencies
            </p>

            <div className="flex flex-wrap gap-2 mob:gap-3.5">
              <Link to="/report" className={btn('navy', 'flex-[1_1_auto] justify-center !px-3.5 !py-[5px] !text-xs mob:flex-none')}>
                Report an Incident
                <ArrowRight className="size-3.5" />
              </Link>
              <Link to="/report" className={btn('outlineDark', 'flex-[1_1_auto] justify-center !px-3.5 !py-[5px] !text-xs mob:flex-none')}>
                Become a Volunteer
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ===== POP-UPS ===== */}
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} alert={activeAlert} />
      <AuthModal
        tab={authTab}
        onTabChange={setAuthTab}
        onClose={() => setAuthTab(null)}
        onShowLegal={setLegalKey}
      />
      <LegalModal which={legalKey} onChange={setLegalKey} onClose={() => setLegalKey(null)} />
    </>
  );
}
