import { useState } from 'react';
import { categoryOf, claimReport, dueAt, fileToDataUrl, formatDateTime, STATUS, submitProof, useReportsState } from '../lib/reports';

const S = {
  section: { marginTop: 28 },
  title: { fontSize: 24, fontWeight: 800, margin: '0 0 4px' },
  sub: { margin: '0 0 16px', opacity: 0.8 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  main: { flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  meta: { fontSize: 14, opacity: 0.75 },
  actions: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' },
  actionsCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 260, textAlign: 'right' },
  proof: { flexBasis: '100%', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 },
  err: { color: '#a00000' },
};

function Thumb({ report }) {
  const base = { width: 120, height: 90, borderRadius: 12, flexShrink: 0, objectFit: 'cover' };
  if (report.photo) return <img src={report.photo} alt="" style={base} />;
  return <div aria-hidden="true" style={{ ...base, background: categoryOf(report.category).tone, opacity: 0.85 }} />;
}

function ReportInfo({ r }) {
  return (
    <div style={S.main}>
      <strong>{r.title}</strong>
      <span style={S.meta}>{categoryOf(r.category).label} · {r.location}</span>
      <span style={S.meta}>Reported {formatDateTime(r.createdAt)}</span>
      <p style={{ margin: '4px 0 0' }}>{r.summary}</p>
    </div>
  );
}

function ProofForm({ report }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5 MB).');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function send() {
    if (!file) {
      setError('Please choose a proof photo.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const photo = await fileToDataUrl(file);
      const res = await submitProof(report.id, photo, note);
      if (!res.ok) setError(res.error);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div style={S.proof}>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
      {preview && <img src={preview} alt="Proof preview" style={{ maxWidth: 240, borderRadius: 12 }} />}
      <textarea
        rows={2}
        maxLength={500}
        placeholder="Short note (what was done)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <span role="alert" style={S.err}>{error}</span>}
      <div>
        <button type="button" className="cmap__btn cmap__btn--primary" disabled={busy} onClick={send}>
          {busy ? 'Uploading…' : 'Submit proof'}
        </button>
      </div>
    </div>
  );
}

function OpenReports({ reports }) {
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const open = reports.filter((r) => !r.isAssigned && r.status !== 'resolved');

  async function take(r) {
    if (!window.confirm(`Handle "${r.title}"?\n\nYou will have 24 hours to upload a proof photo. If you miss it, the report goes back to Open Reports.`)) return;
    setBusyId(r.id);
    setError('');
    const res = await claimReport(r.id);
    setBusyId('');
    if (!res.ok) setError(res.error);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={S.title}>Open Reports</h2>
      <p style={S.sub}>Reports nobody is handling yet. Take one if you can help.</p>
      {error && <p role="alert" style={S.err}>{error}</p>}
      {open.length === 0 && <p className="rempty">No open reports right now.</p>}
      <div style={S.list}>
        {open.map((r) => (
          <article key={r.id} className="adm-row" style={S.card}>
            <Thumb report={r} />
            <ReportInfo r={r} />
            <div style={S.actions}>
              <span className={`rbadge rbadge--${r.status}`}>{STATUS[r.status].label}</span>
              {r.mine ? (
                <span style={S.meta}>Your report</span>
              ) : (
                <button type="button" className="cmap__btn cmap__btn--primary" disabled={busyId === r.id} onClick={() => take(r)}>
                  I'll handle this
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function Assignments() {
  const { reports, loading } = useReportsState();
  const mine = reports.filter((r) => r.assignedToMe);

  return (
    <section aria-label="Volunteer reports">
      {!loading && <OpenReports reports={reports} />}

      <div style={S.section}>
        <h2 style={S.title}>My Assignments</h2>
        <p style={S.sub}>Reports you are handling. Upload a photo as proof within 24 hours. The admin will verify it.</p>

        {loading && <p className="rempty">Loading…</p>}
        {!loading && mine.length === 0 && <p className="rempty">No assignments yet.</p>}

        <div style={S.list}>
          {mine.map((r) => (
            <article key={r.id} className="adm-row" style={S.card}>
              <Thumb report={r} />
              <ReportInfo r={r} />
              <div style={S.actionsCol}>
                <span className={`rbadge rbadge--${r.status}`}>{STATUS[r.status].label}</span>
                {r.assignedAt && (r.proofStatus === 'none' || r.proofStatus === 'rejected') && (
                  <span style={S.meta}>Due: {formatDateTime(dueAt(r))}.Once exceeded, this will be removed back to Open Reports.</span>
                )}
                {r.proofStatus === 'submitted' && <span style={S.meta}>Proof submitted. Waiting for admin.</span>}
                {r.proofStatus === 'approved' && <span style={S.meta}>Approved. Salamat!</span>}
                {r.proofStatus === 'rejected' && <span style={S.meta}>Rejected: {r.proofRejectReason}. Upload a new photo.</span>}
              </div>
              {(r.proofStatus === 'none' || r.proofStatus === 'rejected') && r.status === 'review' && (
                <ProofForm report={r} />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}