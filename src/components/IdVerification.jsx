import { useEffect, useState } from 'react';
import { getMyVerification, submitVerification } from '../lib/verification';
import VerifiedBadge from './VerifiedBadge';

const MAX = 5 * 1024 * 1024;

function checkFile(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG or PNG).';
  if (file.size > MAX) return 'Please choose an image smaller than 5 MB.';
  return '';
}

export default function IdVerification() {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idFile, setIdFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getMyVerification().then(({ row: r, error }) => {
      if (!alive) return;
      setRow(r);
      if (error) setMessage(error);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!idFile) return setMessage('Please choose a photo of your ID.');
    const bad = checkFile(idFile) || checkFile(selfie);
    if (bad) return setMessage(bad);

    setBusy(true);
    setMessage('');
    const result = await submitVerification(idFile, selfie);
    setBusy(false);
    if (!result.ok) return setMessage(result.error);
    setRow(result.row);
    setIdFile(null);
    setSelfie(null);
    setMessage('Submitted. Please wait for an admin to review your ID.');
  }

  const status = row?.status || 'unverified';
  const canSubmit = status === 'unverified' || status === 'rejected';

  return (
    <section className="profile-card">
      <header>
        <h2>ID Verification</h2>
        <p>Verify your identity so the GCare team can trust your reports.</p>
      </header>

      {loading && <p className="profile-form-message">Loading…</p>}

      {!loading && status === 'approved' && (
        <p className="profile-form-message" role="status" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <VerifiedBadge size={24} /> Your ID is verified.
        </p>
      )}

      {!loading && status === 'pending' && (
        <p className="profile-form-message" role="status">⏳ Your ID is waiting for admin review.</p>
      )}

      {!loading && status === 'rejected' && (
        <p className="profile-form-message profile-form-message--error" role="alert">
          ❌ Your ID was rejected. Reason: {row?.reject_reason || 'Not specified.'} You can submit again below.
        </p>
      )}

      {!loading && canSubmit && (
        <form className="profile-password" onSubmit={submit}>
          <label>
            Photo of your ID (front)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setIdFile(e.target.files?.[0] || null)} required />
          </label>
          <label>
            Selfie holding your ID (optional)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
          </label>
          <div className="profile-password__actions">
            <button type="submit" className="profile-button profile-button--primary" disabled={busy}>
              {busy ? 'Uploading…' : 'Submit for verification'}
            </button>
          </div>
        </form>
      )}

      {message && <p className="profile-form-message" role="status">{message}</p>}
    </section>
  );
}