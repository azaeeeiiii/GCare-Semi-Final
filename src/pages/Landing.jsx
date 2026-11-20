import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { AlertBanner, AlertModal } from '../components/Alerts';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/auth';
import { LegalModal } from '../components/LegalModal';
import { ArrowRight, MapPin, btn } from '../components/ui';
import { areaStatus } from '../content';
import { ALERT_LEVELS, useAlerts } from '../lib/alerts';
import { formatDateTime } from '../lib/reports';

const SEVERITY = { critical: 3, warning: 2, advisory: 1 };

export default function Landing() {
  const { hash, state } = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const alerts = useAlerts();
  const [alertOpen, setAlertOpen] = useState(false);

  // The banner shows the most severe ACTIVE alert the admin posted (newest first when equal)
  const activeAlert = useMemo(() => {
    const list = alerts
      .filter((a) => a.active)
      .sort((a, b) => (SEVERITY[b.level] || 0) - (SEVERITY[a.level] || 0) || b.issuedAt.localeCompare(a.issuedAt));
    const a = list[0];
    if (!a) return null;
    return {
      level: ALERT_LEVELS[a.level]?.label || a.level,
      headline: a.title,
      area: a.area,
      issued: formatDateTime(a.issuedAt),
      body: Array.isArray(a.body) ? a.body : [String(a.body || '')],
    };
  }, [alerts]);
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
      <main className="hero">
        {/* Background photo (fades in from the left on desktop, full-bleed + dark overlay on mobile) */}
        <div aria-hidden="true" className="hero__photo" />
        <div aria-hidden="true" className="hero__overlay" />

        {activeAlert && <AlertBanner alert={activeAlert} onViewDetails={() => setAlertOpen(true)} />}

        {/* Headline + status */}
        <div className="hero__intro">
          <h1 className="hero__title">
            Stay Informed.<br />
            Stay Prepared.<br />
            Stay Safe.
          </h1>

          <p className="hero__status">
            <span className="hero__status-dot" aria-hidden="true" />
            <span>{activeAlert ? 'Active alert in effect. Stay alert' : areaStatus.text}</span>
            &bull; Updated:
            <time className="hero__status-time">{activeAlert ? activeAlert.issued : areaStatus.updated}</time>
          </p>
        </div>

        {/* Explore map */}
        <Link
          to="/feed"
          className={btn('white', 'hero__map-btn')}
        >
          <MapPin />
          Explore Safety Map
          <ArrowRight />
        </Link>

        {/* Community card */}
        <section aria-labelledby="communityTitle" className="community-card">
          <img
            src="/images/person_landing.png"
            alt=""
            aria-hidden="true"
            className="community-card__person"
          />

          <div className="community-card__body">
            <h2 id="communityTitle" className="community-card__title">
              Be Part of a Safer Community
            </h2>
            <p className="community-card__text">
              Help keep your community informed by reporting hazards, sharing verified information, or volunteering
              during emergencies
            </p>

            <div className="community-card__actions">
              <Link to="/report" className={btn('navy', 'community-card__btn')}>
                Report an Incident
                <ArrowRight className="arrow-right-small" />
              </Link>
              <Link to="/volunteer" className={btn('outlineDark', 'community-card__btn')} onClick={(e) => { if (!user) { e.preventDefault(); navigate('/#login', { state: { from: '/volunteer' } }); setAuthTab('login'); } }}>
                Become a Volunteer
                <ArrowRight className="arrow-right-small" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ===== POP-UPS ===== */}
      {activeAlert && <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} alert={activeAlert} />}
      <AuthModal
        tab={authTab}
        onTabChange={setAuthTab}
        onClose={() => setAuthTab(null)}
        onShowLegal={setLegalKey}
        onAuthed={() => navigate(state?.from || '/feed', { replace: true })}
      />
      <LegalModal which={legalKey} onChange={setLegalKey} onClose={() => setLegalKey(null)} />
    </>
  );
}
