import { btn, useDialog } from './ui';

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onClose }) {
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="confirmTitle"
      className="confirm-modal"
    >
      <header className="confirm-modal__header">
        <div>
          <h2 id="confirmTitle">{title}</h2>
          <p>{message}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="confirm-modal__close">&times;</button>
      </header>
      <footer className="confirm-modal__footer">
        <button type="button" className={btn('outlineDark')} onClick={onClose}>Cancel</button>
        <button type="button" className="confirm-modal__confirm" onClick={onConfirm}>{confirmLabel}</button>
      </footer>
    </dialog>
  );
}
