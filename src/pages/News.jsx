import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/Header';
import Footer from '../components/Footer';
import { PageHero } from '../components/ui';
import { useAlerts, ALERT_LEVELS } from '../lib/alerts';
import { formatDateTime } from '../lib/reports';
import { useNews, NEWS_CATEGORIES, formatNewsDate } from '../lib/news';

const FILTERS = [['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning'], ['advisory', 'Advisory']];

const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, width: 16, height: 16 };
const PinIcon = () => <svg {...ic}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const ClockIcon = () => <svg {...ic}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

function AlertCard({ alert, open, onToggle }) {
  const level = ALERT_LEVELS[alert.level] || ALERT_LEVELS.advisory;
  const body = Array.isArray(alert.body) ? alert.body : String(alert.body || '').split('\n').filter(Boolean);
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
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <button type="button" className="acard__more" aria-expanded={open} onClick={onToggle}>
        {open ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

function NewsCard({ item, open, onToggle }) {
  const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.update;
  return (
    <article className="acard" style={{ '--level': cat.color }}>
      <div className="acard__top">
        <span className="acard__level">{cat.label}</span>
        <span className="acard__state">{formatNewsDate(item.createdAt)}</span>
      </div>
      <h3 className="acard__title">{item.title}</h3>
      <p className="acard__meta"><ClockIcon />By {item.author}</p>
      {item.image && <img src={item.image} alt="" className="ncard__img" loading="lazy" />}
      <div className={`acard__body ${open ? '' : 'acard__body--clamp'}`.trim()}>
        {(item.body || []).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <button type="button" className="acard__more" aria-expanded={open} onClick={onToggle}>
        {open ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

export default function News() {
  const ALERTS = useAlerts();
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const { news, loading } = useNews();
  const [openNews, setOpenNews] = useState(null);

  useEffect(() => {
    document.title = 'Announcements – GCare';
  }, []);

  const sorted = useMemo(
    () => [...ALERTS].sort((a, b) => Number(b.active) - Number(a.active) || String(b.issuedAt || '').localeCompare(String(a.issuedAt || ''))),
    [ALERTS],
  );
  const shown = sorted.filter((a) => filter === 'all' || a.level === filter);
  const count = (id) => (id === 'all' ? ALERTS.length : ALERTS.filter((a) => a.level === id).length);

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
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
            <h2 className="news-section__title">News &amp; Announcements</h2>
            {loading ? (
              <p className="placeholder">Loading news…</p>
            ) : news.length === 0 ? (
              <p className="placeholder">No news yet. Updates from the GCare team will appear here.</p>
            ) : (
              <div className="alerts-grid">
                {news.map((n) => (
                  <NewsCard key={n.id} item={n} open={openNews === n.id} onToggle={() => setOpenNews(openNews === n.id ? null : n.id)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}