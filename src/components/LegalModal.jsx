import { useEffect, useRef } from 'react';
import { LEGAL } from '../content';
import { LegalLinkContext, btn, useDialog } from './ui';

/* Renders the Terms/Privacy sections (used by the full pages and the pop-up) + the pop-up itself */


export function LegalSections({ which, sectionClass = '' }) {
  return LEGAL[which].sections.map((s, i) => (
    <section key={s.id} id={s.id} className={sectionClass}>
      <h2>{i + 1}. {s.title}</h2>
      {s.body}
    </section>
  ));
}


/* Terms / Privacy pop-up. `which` is null (closed) | 'terms' | 'privacy'.
   Same content as the full pages (src/data/legal.jsx) — only one copy to edit. */
export function LegalModal({ which, onChange, onClose }) {
  const open = which !== null;
  const lastShown = useRef('terms');
  if (which) lastShown.current = which; // keep text while the dialog closes
  const key = lastShown.current;
  const data = LEGAL[key];

  const { ref, onMouseDown, onClick } = useDialog(open, onClose);
  const bodyRef = useRef(null);

  // Jump back to the top whenever Terms <-> Privacy swaps
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [which]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="legalTitle"
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(720px,calc(100%-32px))] max-w-none overflow-hidden rounded-[18px] border-0 bg-white p-0 font-sans text-navy shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop:bg-[rgba(10,15,28,.55)] open:flex open:animate-pop open:flex-col motion-reduce:animate-none"
    >
      <header className="flex items-start justify-between gap-3 border-b border-[#e3e3e1] py-5 pl-[26px] pr-5 max-[640px]:pb-2.5 max-[640px]:pl-[18px] max-[640px]:pr-3.5 max-[640px]:pt-4">
        <div>
          <h3 id="legalTitle" className="m-0 text-[26px] font-extrabold leading-[1.1] max-[640px]:text-[22px]">
            {data.title}
          </h3>
          <p className="mb-0 mt-1 text-[12.5px] font-semibold text-muted">{data.updated}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="size-[34px] flex-none cursor-pointer rounded-full border-0 bg-card text-2xl leading-none text-navy hover:bg-[#e0e0de]"
        >
          &times;
        </button>
      </header>

      <div
        ref={bodyRef}
        tabIndex={0}
        className="legal-prose legal-prose-modal flex-1 overflow-y-auto px-[26px] pb-3.5 pt-1.5 text-[14.5px] leading-[1.55] max-[640px]:px-[18px] max-[640px]:pb-3 max-[640px]:pt-1"
      >
        <LegalLinkContext.Provider value={onChange}>
          <LegalSections which={key} />
        </LegalLinkContext.Provider>
      </div>

      <footer className="flex justify-end border-t border-[#e3e3e1] px-5 py-3">
        <button type="button" className={btn('navy')} onClick={onClose}>Close</button>
      </footer>
    </dialog>
  );
}
