import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedHeader } from '../components/Header';
import BottomNav from '../components/BottomNav';
import Assignments from '../components/Assignments';
import { useUser } from '../lib/auth';
import { EVENTS, SIGNUP_STATUS, cancelSignup, eventOf, formatEventDate, signUp, slotsLeft, useSignups } from '../lib/volunteer';


const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, width: 16, height: 16 };
const PinIcon = () => <svg {...ic}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;

function Tabs({ tab, setTab, user }) {
  const items = [['explore', 'Explore'], ['mine', 'My Activities']];
  if (user) items.push(['reports', 'Reports']);
  return (
    <div className="vtabs" role="tablist">
      {items.map(([id, label]) => (
        <button key={id} type="button" role="tab" aria-selected={tab === id} className={`vtabs__btn ${tab === id ? 'vtabs__btn--on' : ''}`.trim()} onClick={() => setTab(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Badge({ status }) {
  return <span className={`vbadge vbadge--${status}`}>{SIGNUP_STATUS[status].label}</span>;
}

function Explore({ user, signups }) {
  const mineByEvent = useMemo(() => new Map(signups.filter((s) => s.email === user?.email).map((s) => [s.eventId, s])), [signups, user]);

  return (
    <>
      <p className="vintro">Find opportunities to help your community.</p>
      <div className="vgrid">
        {EVENTS.map((e) => {
          const left = slotsLeft(e, signups);
          const mine = mineByEvent.get(e.id);
          return (
            <article key={e.id} className="vcard">
              <h2 className="vcard__title">{e.title}</h2>
              <p className="vcard__where"><PinIcon />{e.location}</p>
              <p className="vcard__text">{e.summary}</p>
              <p className="vcard__when">{formatEventDate(e.date)} · {e.time}</p>
              <p className="vcard__slots">{left === 0 ? 'No slots left' : `${left} slots left`}</p>
              {mine ? (
                <div className="vcard__status"><Badge status={mine.status} /></div>
              ) : user ? (
                <button type="button" className="vbtn" disabled={left === 0} onClick={() => signUp(e.id, user)}>Volunteer</button>
              ) : (
                <Link to="/#login" className="vbtn">Volunteer</Link>
              )}
            </article>
          );
        })}
      </div>

      {!user && (
        <div className="vbanner" role="status">
          <span>Log in to make a difference</span>
          <Link to="/#login" className="vbanner__link">Log in</Link>
        </div>
      )}
    </>
  );
}

function MyActivities({ user, signups, setTab }) {
  if (!user) {
    return (
      <p className="rempty">
        <Link to="/#login" className="vlink">Log in</Link> to see the activities you signed up for.
      </p>
    );
  }

  const mine = signups.filter((s) => s.email === user.email);

  return (
    <div className="vlist">
      {mine.length === 0 && (
        <p className="rempty">
          You haven’t volunteered for anything yet.{' '}
          <button type="button" className="vlink" onClick={() => setTab('explore')}>Browse opportunities</button>
        </p>
      )}
      {mine.map((s) => {
        const e = eventOf(s.eventId);
        if (!e) return null;
        return (
          <article key={s.id} className="vcard vcard--wide">
            <div className="vcard__badge"><Badge status={s.status} /></div>
            <h2 className="vcard__title">{e.title}</h2>
            <p className="vcard__strong">{formatEventDate(e.date)} · {e.time}</p>
            <p className="vcard__strong">{e.location}</p>
            <p className="vcard__text vcard__text--gap">{e.summary}</p>
            <p className="vcard__text">Role: {e.role}</p>
            <p className="vcard__note">{s.status === 'approved' ? `Reminder: ${e.reminder}` : SIGNUP_STATUS[s.status].note}</p>
            {s.status !== 'rejected' && (
              <button type="button" className="vlink vlink--cancel" onClick={() => cancelSignup(s.id)}>Cancel</button>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function Volunteer() {
  const user = useUser();
  const signups = useSignups();
  const [tab, setTab] = useState('explore');

  useEffect(() => {
    document.title = 'Volunteer – GCare';
  }, []);

  return (
    <div className="feed">
      <FeedHeader user={user} />
      <main className="feed__main rpt-main">
        <section className="rpt" aria-label="Volunteer">
          <h1 className="rpt__title">Volunteer</h1>
          <Tabs tab={tab} setTab={setTab} user={user} />
          {tab === 'explore' && <Explore user={user} signups={signups} />}
          {tab === 'mine' && <MyActivities user={user} signups={signups} setTab={setTab} />}
          {tab === 'reports' && user && <Assignments />}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}