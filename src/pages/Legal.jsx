import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Header';
import Footer from '../components/Footer';
import { LegalSections } from '../components/LegalModal';
import { ContactLink, LegalRef, PageHero, btn } from '../components/ui';
import { LEGAL } from '../content';

const LABEL = { terms: 'Terms of Use', privacy: 'Privacy Policy' };

/* Used for both /terms and /privacy */
export default function Legal({ which }) {
  const data = LEGAL[which];
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    document.title = `${data.title} – GCare`;
  }, [data.title]);

  // Highlight the current section in "On this page" while scrolling
  useEffect(() => {
    setActiveId(null);
    if (!('IntersectionObserver' in window)) return;
    const sections = [...document.querySelectorAll('.legal-article section[id]')];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActiveId(en.target.id)),
      { rootMargin: '-15% 0px -70% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [which]);

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
        <PageHero title={data.title}>
          <p className="page-hero__meta">{data.updated}</p>
        </PageHero>

        <div className="legal-layout">
          {/* Table of contents (sticky on desktop) */}
          <nav aria-label="On this page" className="legal-toc">
            <p className="legal-toc__title">On this page</p>
            <ol className="legal-toc__list">
              {data.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`legal-toc__link ${activeId === s.id ? 'legal-toc__link--active' : ''}`.trim()}
                  >
                    <span className="legal-toc__num">{i + 1}. </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-article legal-prose legal-prose-page">
            <LegalSections which={which} sectionClass="legal-section" />

            {/* Links to the other page + contact */}
            <aside className="legal-aside">
              <p className="legal-aside__text">
                Also read our <LegalRef to={data.alsoRead}>{LABEL[data.alsoRead]}</LegalRef>, or get in touch through
                the <ContactLink />.
              </p>
              <Link to="/" className={btn('navy')}>Back to home</Link>
            </aside>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
