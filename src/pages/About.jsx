import { useEffect } from 'react';
import { PageHeader } from '../components/Header';
import Footer from '../components/Footer';
import { PageHero } from '../components/ui';
import { ABOUT } from '../content';

/* About GCare page (/about). Same layout as Terms / Privacy: header, navy title band, white content, footer.
   Text lives in content.jsx -> ABOUT. Styles: styles/about.css

   ICONS
   - bell, hazard, people  -> real images from /public/images (the *_icon_circle.png files)
   - volunteer, shield     -> SVG PLACEHOLDERS (marked "TODO image" below).
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
  useEffect(() => {
    document.title = 'About GCare – GCare';
  }, []);

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
        <PageHero title={ABOUT.title}>
          <p className="page-hero__meta">{ABOUT.tagline}</p>
        </PageHero>

        <div className="page-content about-content">
          <p className="about-intro">{ABOUT.intro}</p>

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
      </main>

      <Footer />
    </div>
  );
}