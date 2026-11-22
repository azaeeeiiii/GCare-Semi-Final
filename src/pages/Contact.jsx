import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Header';
import Footer from '../components/Footer';
import { PageHero, btn } from '../components/ui';
import { useUser } from '../lib/auth';
import { submitContactMessage } from '../lib/contact';
import { CONTACT } from '../content';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;
export default function Contact() {
  const user = useUser();
  const navigate = useNavigate();
  const successDialogRef = useRef(null);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us – GCare';
  }, []);

  useEffect(() => {
    const dialog = successDialogRef.current;
    if (!dialog) return;
    if (successOpen && !dialog.open) dialog.showModal();
    if (!successOpen && dialog.open) dialog.close();
  }, [successOpen]);

  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;
    if (!category) return setStatus({ ok: false, msg: 'Please select a message category.' });
    if (message.trim().length < MIN_LENGTH) {
      return setStatus({ ok: false, msg: `Please write at least ${MIN_LENGTH} characters in your message.` });
    }

    setSending(true);
    setStatus(null);
    const result = await submitContactMessage({ category, message: message.trim(), user });
    setSending(false);

    if (!result.ok) {
      setStatus({ ok: false, msg: result.error });
      return;
    }

    setCategory('');
    setMessage('');
    setSuccessOpen(true);
  }

  function submitAnother() {
    setSuccessOpen(false);
    requestAnimationFrame(() => document.getElementById('contactMessage')?.focus());
  }

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
        <PageHero title={CONTACT.title}>
          <p className="page-hero__meta">{CONTACT.tagline}</p>
        </PageHero>

        <div className="page-content contact-content">
          {/* Intro */}
          <section className="contact-intro">
            {CONTACT.intro.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>

          {/* How can we help */}
          <section aria-labelledby="helpTitle" className="contact-section">
            <h2 id="helpTitle" className="contact-section__title">{CONTACT.helpTitle}</h2>
            <ul className="contact-help">
              {CONTACT.help.map((h) => (
                <li key={h.title} className="contact-help__card">
                  <strong className="contact-help__title">{h.title}</strong>
                  <p className="contact-help__text">{h.text}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Message form */}
          <section aria-labelledby="formTitle" className="contact-section">
            <h2 id="formTitle" className="contact-section__title">{CONTACT.formTitle}</h2>
            <p className="contact-section__text">{CONTACT.formIntro}</p>

            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <fieldset className="contact-fieldset">
                <legend className="contact-label">{CONTACT.categoryLabel}</legend>
                <div className="contact-options">
                  {CONTACT.categories.map((c) => (
                    <label key={c} className="contact-option">
                      <input
                        type="radio"
                        name="category"
                        value={c}
                        checked={category === c}
                        onChange={() => {
                          setCategory(c);
                          setStatus(null);
                        }}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="contact-field">
                <label htmlFor="contactMessage" className="contact-label">{CONTACT.messageLabel}</label>
                <p id="contactMessageHelp" className="contact-help-text">{CONTACT.messageHelp}</p>
                <textarea
                  id="contactMessage"
                  className="contact-textarea"
                  rows={6}
                  maxLength={MAX_LENGTH}
                  placeholder={CONTACT.placeholder}
                  aria-describedby="contactMessageHelp"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setStatus(null);
                  }}
                />
                <span className="contact-count">{message.length}/{MAX_LENGTH}</span>
              </div>

              <div className="contact-actions">
                <button type="submit" className={btn('navy')} disabled={sending}>{sending ? 'Submitting...' : CONTACT.submit}</button>
                <p
                  role="status"
                  aria-live="polite"
                  className={`contact-status ${status ? (status.ok ? 'contact-status--ok' : 'contact-status--error') : ''}`.trim()}
                >
                  {status?.msg}
                </p>
              </div>
            </form>
          </section>

          {/* Thank you */}
          <section className="contact-thanks" aria-labelledby="thanksTitle">
            <h2 id="thanksTitle" className="contact-section__title">{CONTACT.thanksTitle}</h2>
            <p className="contact-section__text">{CONTACT.thanksText}</p>
          </section>
        </div>
      </main>

      <dialog
        ref={successDialogRef}
        className="contact-success-modal"
        aria-labelledby="contactSuccessTitle"
        onClose={() => setSuccessOpen(false)}
      >
        <div className="contact-success-modal__icon" aria-hidden="true">✓</div>
        <h2 id="contactSuccessTitle">Successfully submitted</h2>
        <p>Thank you! Your suggestion or message has been submitted successfully.</p>
        <div className="contact-success-modal__actions">
          <button type="button" className={btn('outlineDark')} onClick={() => navigate('/')}>Return to Home</button>
          <button type="button" className={btn('navy')} onClick={submitAnother}>Submit Another</button>
        </div>
      </dialog>

      <Footer />
    </div>
  );
}