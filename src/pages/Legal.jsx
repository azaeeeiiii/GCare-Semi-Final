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
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="flex-1">
        <PageHero title={data.title}>
          <p className="mb-0 mt-2 text-sm font-semibold opacity-85">{data.updated}</p>
        </PageHero>

        <div className="mx-auto grid max-w-[1040px] grid-cols-1 items-start gap-6 px-[clamp(16px,4vw,40px)] pb-14 pt-6 min-[821px]:grid-cols-[230px_minmax(0,1fr)] min-[821px]:gap-12 min-[821px]:pt-[34px]">
          {/* Table of contents (sticky on desktop) */}
          <nav
            aria-label="On this page"
            className="rounded-xl bg-card px-4 py-3.5 min-[821px]:sticky min-[821px]:top-4 min-[821px]:rounded-none min-[821px]:border-l-[3px] min-[821px]:border-[#e1e4ea] min-[821px]:bg-transparent min-[821px]:py-0 min-[821px]:pl-4 min-[821px]:pr-0"
          >
            <p className="mb-2 mt-0 text-xs font-extrabold uppercase tracking-[.6px] text-muted">On this page</p>
            <ol className="m-0 list-none p-0">
              {data.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block py-[5px] text-sm hover:text-navy ${
                      activeId === s.id ? 'font-extrabold text-navy' : 'font-semibold text-[#4a5368]'
                    }`}
                  >
                    <span className="opacity-60">{i + 1}. </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-article legal-prose legal-prose-page min-w-0">
            <LegalSections which={which} sectionClass="mb-[30px] scroll-mt-5" />

            {/* Links to the other page + contact */}
            <aside className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-card px-[22px] py-5">
              <p className="!mb-0 !text-[15px]">
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
