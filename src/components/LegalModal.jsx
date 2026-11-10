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
      className="legal-modal"
    >
      <header className="legal-modal__header">
        <div>
          <h3 id="legalTitle" className="legal-modal__title">
            {data.title}
          </h3>
          <p className="legal-modal__updated">{data.updated}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="legal-modal__close"
        >
          &times;
        </button>
      </header>

      <div
        ref={bodyRef}
        tabIndex={0}
        className="legal-prose legal-prose-modal legal-modal__body"
      >
        <LegalLinkContext.Provider value={onChange}>
          <LegalSections which={key} />
        </LegalLinkContext.Provider>
      </div>

      <footer className="legal-modal__footer">
        <button type="button" className={btn('navy')} onClick={onClose}>Close</button>
      </footer>
    </dialog>
  );
}
