import { useEffect, useState } from 'react';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useUser } from '../lib/auth';
import {
  STATUS,
  assignReport,
  categoryOf,
  deleteReport,
  dueAt,
  formatDateTime,
  listVolunteers,
  reviewProof,
  setReportStatus,
  useReportsState,
} from '../lib/reports';

export default function Admin() {
  const user = useUser();
  const { reports, loading } = useReportsState();
  const [volunteers, setVolunteers] = useState([]);
  const [picked, setPicked] = useState({});
  const [msg, setMsg] = useState({});

  useEffect(() => {
    document.title = 'Admin – GCare';
    listVolunteers().then(({ rows }) => setVolunteers(rows));
  }, []);

  const volunteerName = (id) => volunteers.find((v) => v.user_id === id)?.name || 'Volunteer';
  const flash = (id, text) => setMsg((m) => ({ ...m, [id]: text }));

  async function assign(r) {
    const vid = picked[r.id];
    if (!vid) return flash(r.id, 'Choose a volunteer first.');
    const res = await assignReport(r.id, vid);
    flash(r.id, res.ok ? '' : res.error);
  }

  async function approve(r) {
    if (!window.confirm(`Approve the proof for "${r.title}"?\n\nThe report becomes Resolved and the proof becomes public.`)) return;
    const res = await reviewProof(r.id, 'approve');
    if (!res.ok) flash(r.id, res.error);
  }

  async function reject(r) {
    const reason = window.prompt('Reason for rejecting this proof:');
    if (reason === null) return;
    const res = await reviewProof(r.id, 'reject', reason);
    if (!res.ok) flash(r.id, res.error);
  }

  function remove(r) {
    if (!window.confirm(`Delete "${r.title}"?\n\nThis cannot be undone.`)) return;
    deleteReport(r.id);
  }

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Admin">
          <h1 className="rpt__title">Admin: Reports</h1>
          <p className="rpt__sub">Press Start review first. Once a report is Under Review, you can assign a volunteer (or a volunteer can take it, with 24 hours to submit proof). A report becomes Resolved only after you approve the proof photo.</p>

          <div className="adm-list">
            {loading && <p className="rempty">Loading reports…</p>}
            {!loading && reports.length === 0 && <p className="rempty">No reports yet.</p>}
            {reports.map((r) => {
              const locked = r.status === 'resolved' || ['submitted', 'approved'].includes(r.proofStatus);
              const canAssign = r.status === 'review' && !locked;
              return (
                <article key={r.id} className="adm-row">
                  {r.photo && <img src={r.photo} alt="" className="adm-row__img" />}
                  <div className="adm-row__main">
                    <strong>{r.title}</strong>
                    <span>{categoryOf(r.category).label} · {r.location}</span>
                    <span>By {r.authorName} · {formatDateTime(r.createdAt)}</span>
                    <p>{r.summary}</p>
                    {r.assignedTo && <span>Assigned to: <strong>{volunteerName(r.assignedTo)}</strong></span>}
                    {r.assignedTo && r.assignedAt && ['none', 'rejected'].includes(r.proofStatus) && r.status !== 'resolved' && (
                      <span>Due: {formatDateTime(dueAt(r))}</span>
                    )}
                    {r.proofStatus === 'rejected' && <span>Proof rejected: {r.proofRejectReason}</span>}

                    {r.proofStatus === 'submitted' && (
                      <div>
                        <span>Proof from volunteer · {r.proofSubmittedAt && formatDateTime(r.proofSubmittedAt)}</span>
                        <img src={r.proofUrl} alt="Proof" className="adm-row__img" />
                        {r.proofNote && <p>{r.proofNote}</p>}
                        <button type="button" className="cmap__btn cmap__btn--primary" onClick={() => approve(r)}>Approve</button>{' '}
                        <button type="button" className="cmap__btn" onClick={() => reject(r)}>Reject</button>
                      </div>
                    )}
                    {msg[r.id] && <span role="alert" style={{ color: '#a00000' }}>{msg[r.id]}</span>}
                  </div>

                  <div className="adm-row__actions">
                    <span className={`rbadge rbadge--${r.status}`}>{STATUS[r.status].label}</span>

                    {r.status === 'pending' && (
                      <span style={{ fontSize: 13, opacity: 0.75 }}>Start review to assign a volunteer.</span>
                    )}

                    {canAssign && (
                      <>
                        <select
                          value={picked[r.id] || ''}
                          onChange={(e) => setPicked((p) => ({ ...p, [r.id]: e.target.value }))}
                          aria-label="Volunteer"
                        >
                          <option value="">{volunteers.length ? 'Choose volunteer…' : 'No approved volunteers'}</option>
                          {volunteers.map((v) => (
                            <option key={v.user_id} value={v.user_id}>{v.name}</option>
                          ))}
                        </select>
                        <button type="button" className="cmap__btn cmap__btn--primary" onClick={() => assign(r)}>
                          {r.assignedTo ? 'Reassign' : 'Assign volunteer'}
                        </button>
                      </>
                    )}

                    <button type="button" className="cmap__btn" disabled={r.status !== 'pending'} onClick={() => setReportStatus(r.id, 'review')}>
                      Start review
                    </button>
                    <button type="button" className="vlink vlink--cancel" onClick={() => remove(r)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}