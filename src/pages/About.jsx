import { useEffect } from 'react';
import { SimpleHeader } from '../components/Header';
import Footer from '../components/Footer';
import { useGoBack } from '../components/ui';
import { ABOUT } from '../content';

/* About GCare page (/about). Text lives in content.jsx -> ABOUT. Styles: styles/about.css

   ICONS
   - bell, hazard, people  -> real images from /public/images (the *_icon_circle.png files)
   - volunteer, shield, close (X), sky + hills picture -> SVG PLACEHOLDERS (marked "TODO image" below).
     To swap one for an image: put the file in /public/images and replace the <svg> with <img>. */

/* TODO image: Volunteer icon (SVG placeholder, a heart).
   Replace with: <img src="/images/volunteer_icon_circle.png" alt="" className="about-card__img" /> */
const VolunteerSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="about-card__svg">
    <path
      d="M12 20.5s-7.5-4.6-9.2-9.6C1.7 7.6 3.8 4.8 6.8 4.8c2 0 3.7 1.1 5.2 3 1.5-1.9 3.2-3 5.2-3 3 0 5.1 2.8 4 6.1-1.7 5-9.2 9.6-9.2 9.6z"
      fill="#fff"
    />
  </svg>
);

/* TODO image: shield-with-check icon in the bottom banner (SVG placeholder).
   Replace with: <img src="/images/shield_check_icon.png" alt="" className="about-banner__icon" /> */
const ShieldSvg = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="about-banner__icon">
    <path d="M24 4l16 6v12c0 10-7 17-16 20C15 39 8 32 8 22V10l16-6z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
    <path d="M16 24l6 6 11-12" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* TODO image: close (X) button icon (SVG placeholder).
   Replace the <svg> inside the close link with an <img> if you have an X image. */
const CloseSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="about-card__close-icon">
    <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/* TODO image: the sky + cloud + green hills picture on the left (SVG placeholder).
   Replace the whole <svg> with: <img src="/images/about_hills.png" alt="" className="about-card__art-img" />
   (the CSS class makes the picture fill the panel) */
const SkyArt = () => (
  <svg viewBox="0 0 300 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" className="about-card__art-img">
    <defs>
      <linearGradient id="aboutSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b9e3fb" />
        <stop offset="0.75" stopColor="#f3fbff" />
      </linearGradient>
    </defs>
    <rect width="300" height="440" fill="url(#aboutSky)" />
    {/* cloud */}
    <g fill="#fff">
      <circle cx="95" cy="98" r="26" />
      <circle cx="130" cy="80" r="33" />
      <circle cx="170" cy="100" r="25" />
      <rect x="70" y="98" width="125" height="28" rx="14" />
    </g>
    {/* back hill (light green) */}
    <path d="M0 330 C60 290 140 282 220 305 S290 335 300 330 V440 H0 Z" fill="#c6e08a" />
    {/* front hill (dark green) */}
    <path d="M0 372 C70 340 160 330 300 392 V440 H0 Z" fill="#8ba300" />
  </svg>
);

/* Real images for the cards. 'volunteer' has no image yet, so it uses the SVG above. */
const ICON_SRC = {
  bell: '/images/bell_icon_circle.png',
  hazard: '/images/hazard_icon_circle.png',
  people: '/images/people_icon_circle.png',
};

function FeatureIcon({ name }) {
  const src = ICON_SRC[name];
  return (
    <span className="about-card__icon" aria-hidden="true">
      {src ? <img src={src} alt="" className="about-card__img" /> : <VolunteerSvg />}
    </span>
  );
}

export default function About() {
  const goBack = useGoBack();

  useEffect(() => {
    document.title = 'About GCare – GCare';
  }, []);

  return (
    <div className="page">
      <SimpleHeader />

      <main className="page__main about">
        <section className="about-card" aria-labelledby="aboutTitle">
          {/* Left: sky + hills picture (hidden on phones) */}
          <div className="about-card__art">
            <SkyArt />
          </div>

          {/* Right: content */}
          <div className="about-card__content">
            <a href="/" onClick={goBack} aria-label="Close" className="about-card__close">
              <CloseSvg />
            </a>

            <h1 id="aboutTitle" className="about-card__title">{ABOUT.title}</h1>
            <p className="about-card__tagline">{ABOUT.tagline}</p>
            <p className="about-card__intro">{ABOUT.intro}</p>

            <ul className="about-features">
              {ABOUT.features.map((f) => (
                <li key={f.title} className="about-feature">
                  <FeatureIcon name={f.icon} />
                  <div>
                    <strong className="about-feature__title">{f.title}</strong>
                    <p className="about-feature__text">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="about-banner">
              <ShieldSvg />
              <span className="about-banner__divider" aria-hidden="true" />
              <p className="about-banner__text">
                <strong>{ABOUT.banner.title}</strong>
                <span>{ABOUT.banner.text}</span>
              </p>
              {/* clouds.png is shown grey here via CSS (see .about-banner__clouds) */}
              <img src="/images/clouds.png" alt="" aria-hidden="true" className="about-banner__clouds" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}