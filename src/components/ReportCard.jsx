// Displays a community incident report card with its details, status, and expandable description.

import { useState } from 'react';
import { ArrowRight } from './ui';
import { VerifiedMark } from './VerifiedBadge';
import { STATUS, formatDate } from '../lib/reports';

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const CalendarIcon = () => (
  <svg {...svg} className="feed-icon feed-icon--sm"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
);
const ReportDocIcon = () => (
  <svg {...svg} className="feed-icon"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" /></svg>
);

export default function ReportCard({ item, selected = false, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      id={`card-${item.id}`}
      className={`news-card ${selected ? 'news-card--selected' : ''}`.trim()}
      onClick={() => onSelect?.(item.id)}
    >
      {item.image ? (
        <img src={item.image} alt="" className="news-card__img" loading="lazy" />
      ) : (
        <div className="news-card__img news-card__img--empty" style={{ '--tone': item.tone }} aria-hidden="true">
          <ReportDocIcon />
        </div>
      )}

      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__tag" style={{ backgroundColor: item.tone }}>{item.tag}</span>
          <span className={`news-card__tag news-card__tag--status news-card__tag--${item.status}`}>{STATUS[item.status]?.label}</span>
          <time className="news-card__date"><CalendarIcon />{item.date}</time>
        </div>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__where">{item.location}</p>
        <p className={`news-card__text ${open ? '' : 'news-card__text--clamp'}`.trim()}>{item.excerpt}</p>
        {open && (
          <>
            <p className="news-card__by">
              Reported by {item.author}
              <VerifiedMark userId={item.authorId} size={14} />
            </p>
            {item.proofStatus === 'approved' && item.proofUrl && (
              <div className="news-card__proof">
                <p className="news-card__by"><strong>Proof of resolution</strong></p>
                <img src={item.proofUrl} alt="Proof of resolution" className="news-card__img" loading="lazy" />
                {item.proofNote && <p className="news-card__text">{item.proofNote}</p>}
                {item.resolvedAt && <p className="news-card__by">Resolved on {formatDate(item.resolvedAt)}</p>}
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        className="news-card__go"
        aria-expanded={open}
        aria-label={open ? `Show less: ${item.title}` : `Read more: ${item.title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <ArrowRight className={`arrow-right ${open ? 'news-card__go-icon--open' : ''}`.trim()} />
      </button>
    </article>
  );
}