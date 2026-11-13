import { Link } from 'react-router-dom';
import { ArrowRight, btn, useDialog } from './ui';

/* The red alert banner on the landing page + its details pop-up */


/* Red "ACTIVE ALERTS" pill at the top of the hero */
export function AlertBanner({ alert, onViewDetails }) {
  return (
    <section aria-label="Active alerts" className="alert-banner">
      <img src="/images/warning_icon.png" alt="" aria-hidden="true" className="alert-banner__icon" />

      <span className="alert-banner__divider" aria-hidden="true" />

      <strong className="alert-banner__title">ACTIVE ALERTS</strong>

      <span className="alert-banner__level">{alert.level}</span>

      <p className="alert-banner__text">
        <strong>{alert.headline}</strong> - <span>{alert.area}</span>
        <br />
        <span>Issued: {alert.issued}</span>
      </p>

      <img src="/images/clouds.png" alt="" aria-hidden="true" className="alert-banner__clouds" />

      <button
        type="button"
        onClick={onViewDetails}
        className={btn('outlineLight', 'alert-banner__details')}
      >
        View Details
        <ArrowRight />
      </button>
    </section>
  );
}


export function AlertModal({ open, onClose, alert }) {
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="modalTitle"
      className="alert-modal"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="alert-modal__close"
      >
        &times;
      </button>

      <span className="alert-modal__level">
        {alert.level}
      </span>

      <h3 id="modalTitle" className="alert-modal__title">
        {alert.headline}
      </h3>
      <p className="alert-modal__meta">
        {alert.area} &bull; Issued: {alert.issued}
      </p>

      <div className="alert-modal__body">
        {alert.body.map((text, i) => (
          <p key={i} className="alert-modal__text">{text}</p>
        ))}
      </div>

      <div className="alert-modal__actions">
      <Link to="/news#alerts" onClick={onClose} className={btn('navy')}>See all alerts</Link>        <button type="button" className={btn('outlineDark')} onClick={onClose}>Close</button>
      </div>
    </dialog>
  );
}
