import { useEffect, useState } from 'react';
import { PageHeader } from '../components/Header';
import Footer from '../components/Footer';
import { PageHero, btn } from '../components/ui';
import { useUser } from '../lib/auth';
import { CONTACT } from '../content';

/* Contact page (/contact). Same layout as Terms / Privacy. Text lives in content.jsx -> CONTACT.
   Styles: styles/contact.css */

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;
const MESSAGES_KEY = 'gcare_messages';

/* FRONT-END ONLY for now: the message is saved in this browser (localStorage), like reports.js.
   TODO backend: replace the body of this function with a fetch('/api/messages', { method: 'POST', ... })
   so the message really reaches the GCare team (and/or sends an email). */
function saveMessage({ category, message, user }) {
  try {
    const list = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    list.unshift({
      id: `m-${Date.now().toString(36)}`,
      category,
      message,
      authorName: user?.name || '',
      authorEmail: user?.email || '',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: ignore */
  }
}

export default function Contact() {
  const user = useUser();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // null | { ok: boolean, msg: string }

  useEffect(() => {
    document.title = 'Contact Us – GCare';
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    if (!category) return setStatus({ ok: false, msg: 'Please select a message category.' });
    if (message.trim().length < MIN_LENGTH) {
      return setStatus({ ok: false, msg: `Please write at least ${MIN_LENGTH} characters in your message.` });
    }
    saveMessage({ category, message: message.trim(), user });
    setStatus({ ok: true, msg: 'Your message has been submitted. Thank you for reaching out!' });
    setCategory('');
    setMessage('');
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
                <button type="submit" className={btn('navy')}>{CONTACT.submit}</button>
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

      <Footer />
    </div>
  );
}