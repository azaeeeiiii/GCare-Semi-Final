import { useEffect, useState } from 'react';
import { getMyVerification, listVerifiedIds } from '../lib/verification';

const N = 12;
const STEPS = 96;
const BADGE_PATH =
  Array.from({ length: STEPS }, (_, i) => {
    const t = (i / STEPS) * Math.PI * 2;
    const r = 10.4 + 1.3 * Math.cos(N * t);
    const x = 12 + r * Math.cos(t);
    const y = 12 + r * Math.sin(t);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ') + ' Z';

export default function VerifiedBadge({ size = 22, title = 'Verified' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <title>{title}</title>
      <path d={BADGE_PATH} fill="#1d9bf0" />
      <path
        d="M7.4 12.4l3.1 3.1 6.1-6.6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MyVerifiedBadge({ size = 22 }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    getMyVerification().then(({ row }) => {
      if (alive) setOk(row?.status === 'approved');
    });
    return () => { alive = false; };
  }, []);

  if (!ok) return null;
  return (
    <span style={{ marginLeft: 8, display: 'inline-flex', verticalAlign: 'middle' }}>
      <VerifiedBadge size={size} />
    </span>
  );
}

let cache = null;

export function VerifiedMark({ userId, size = 16 }) {
  const [ids, setIds] = useState(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    listVerifiedIds().then((s) => {
      cache = s;
      if (alive) setIds(s);
    });
    return () => { alive = false; };
  }, []);

  if (!userId || !ids || !ids.has(userId)) return null;
  return (
    <span style={{ marginLeft: 6, display: 'inline-flex', verticalAlign: 'middle' }}>
      <VerifiedBadge size={size} />
    </span>
  );
}