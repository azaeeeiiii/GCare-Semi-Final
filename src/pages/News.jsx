import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/Header';
import { PageHero } from '../components/ui';
import Footer from '../components/Footer';
import { ALERTS, ALERT_LEVELS } from '../lib/alerts';
import { formatDateTime } from '../lib/reports';

const FILTERS = [['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning'], ['advisory', 'Advisory']];

const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, width: 16, height: 16 };
const PinIcon = () => <svg {...ic}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const ClockIcon = () => <svg {...ic}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

function AlertCard({ alert, open, onToggle }) {
  const level = ALERT_LEVELS[alert.level];
  return (
    <article className={`acard ${alert.active ? '' : 'acard--off'}`.trim()} style={{ '--level': level.color }}>
      <div className="acard__top">
        <span className="acard__level">{level.label}</span>
        <span className={`acard__state ${alert.active ? 'acard__state--on' : ''}`.trim()}>{alert.active ? 'Active' : 'Lifted'}</span>
      </div>
      <h3 className="acard__title">{alert.title}</h3>
      <p className="acard__meta"><PinIcon />{alert.area}</p>
      <p className="acard__meta"><ClockIcon />Issued: {formatDateTime(alert.issuedAt)}</p>
      <div className={`acard__body ${open ? '' : 'acard__body--clamp'}`.trim()}>
        {alert.body.map((p) => <p key={p}>{p}</p>)}
      </div>
      <button type="button" className="acard__more" aria-expanded={open} onClick={onToggle}>
        {open ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

export default function News() {
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    document.title = 'Latest News – GCare';
  }, []);

  const sorted = useMemo(
    () => [...ALERTS].sort((a, b) => Number(b.active) - Number(a.active) || b.issuedAt.localeCompare(a.issuedAt)),
    [],
  );
  const shown = sorted.filter((a) => filter === 'all' || a.level === filter);
  const count = (id) => (id === 'all' ? ALERTS.length : ALERTS.filter((a) => a.level === id).length);

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
        <PageHero title="Latest News" />

        <div className="page-content page-content--news">
          <section id="alerts" className="news-section">
            <h2 className="news-section__title">Alerts</h2>

            <div className="rchips" role="group" aria-label="Filter alerts by level">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={filter === id} className={`rchip ${filter === id ? 'rchip--on' : ''}`.trim()} onClick={() => setFilter(id)}>
                  {label} ({count(id)})
                </button>
              ))}
            </div>

            {shown.length === 0 ? (
              <p className="placeholder alerts-empty">No alerts in this category right now.</p>
            ) : (
              <div className="alerts-grid">
                {shown.map((a) => (
                  <AlertCard key={a.id} alert={a} open={openId === a.id} onToggle={() => setOpenId(openId === a.id ? null : a.id)} />
                ))}
              </div>
            )}
          </section>

          <section id="news" className="news-section">
            <h2 className="news-section__title">News</h2>
            <p className="placeholder">News and updates from the GCare team will appear here.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}