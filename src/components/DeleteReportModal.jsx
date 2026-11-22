// Asks the resident why they want to delete their report before it is removed.

import { useEffect, useState } from 'react';
import { btn, useDialog } from './ui';
import { DELETE_REASONS } from '../lib/reports';

export default function DeleteReportModal({ open, report, onConfirm, onClose }) {
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setDetails('');
      setError('');
      setWorking(false);
    }
  }, [open, report?.id]);

  async function submit(e) {
    e.preventDefault();
    if (working) return;
    if (!reason) return setError('Please choose a reason for deleting this report.');
    if (reason === 'other' && details.trim().length < 3) return setError('Please tell us your reason.');
    setError('');
    setWorking(true);
    try {
      await onConfirm(reason, details);
    } catch (err) {
      setError(err.message || 'Could not delete the report. Please try again.');
      setWorking(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="deleteReportTitle"
      className="confirm-modal delete-report"
    >
      <form onSubmit={submit} noValidate>
        <header className="confirm-modal__header">
          <div>
            <h2 id="deleteReportTitle">Delete this report?</h2>
            <p>
              {report ? <strong>{report.title}</strong> : 'This report'} will be removed from the community feed.
              This can’t be undone. Why are you deleting it?
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="confirm-modal__close">&times;</button>
        </header>

        <div className="delete-report__body">
          <div className="delete-report__reasons" role="radiogroup" aria-label="Reason for deleting">
            {DELETE_REASONS.map((r) => (
              <label key={r.id} className={`delete-report__option ${reason === r.id ? 'delete-report__option--on' : ''}`.trim()}>
                <input
                  type="radio"
                  name="deleteReason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => { setReason(r.id); setError(''); }}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <textarea
            className="rtext"
            rows={3}
            maxLength={300}
            value={details}
            onChange={(e) => { setDetails(e.target.value); setError(''); }}
            placeholder={reason === 'other' ? 'Please tell us your reason (required)' : 'Add more details (optional)'}
            aria-label="More details"
          />

          {error && <p className="confirm-modal__error" role="alert">{error}</p>}
        </div>

        <footer className="confirm-modal__footer">
          <button type="button" className={btn('outlineDark')} onClick={onClose}>Cancel</button>
          <button type="submit" className="confirm-modal__confirm" disabled={working}>{working ? 'Deleting...' : 'Delete report'}</button>
        </footer>
      </form>
    </dialog>
  );
}