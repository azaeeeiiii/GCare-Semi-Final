// Handles the floating GCare AI chat assistant, including dragging,
// chat messages, and sending questions to the chat service.

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';
import { api } from '../lib/api';
import { findHotlines, telHref } from '../lib/hotlines';

const WELCOME = { role: 'bot', text: "Hi! I'm the GCare Assistant. Ask me about reports, alerts, and volunteer events." };
const SUGGEST = ['Who do I call in an emergency?', 'Are there any alerts right now?', 'Which volunteer events are open?', 'How do I report a hazard?'];
const SIZE = 54;
const KEY = 'gcare-chat-pos-v2';

const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));
const defaultPos = () => ({ x: window.innerWidth - 16 - SIZE, y: 90 });

function loadPos() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s.x === 'number' && typeof s.y === 'number') return s;
  } catch (_) {}
  return defaultPos();
}

function HotlineList({ data }) {
  return (
    <div className="cw__hot">
      <p className="cw__hot-title">{data.title}</p>
      {data.groups.map((g) => (
        <div key={g.label} className="cw__hot-group">
          <p className="cw__hot-label">{g.label}</p>
          {g.items.map((h) => (
            <div key={h.name} className="cw__hot-item">
              <strong>{h.name}</strong>
              <span className="cw__hot-nums">
                {h.numbers.map((n) => <a key={n} href={telHref(n)}>{n}</a>)}
              </span>
              {h.note && <small>{h.note}</small>}
            </div>
          ))}
        </div>
      ))}
      <p className="cw__hot-foot">Tap a number to call. If someone is in immediate danger, call right away.</p>
    </div>
  );
}

/* Floating, draggable AI assistant. Sends questions to the Express server. */
export default function ChatWidget() {
  const user = useUser();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(loadPos);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const endRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy, open]);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setVp({ w, h });
      setPos((p) => ({ x: clamp(p.x, 8, w - SIZE - 8), y: clamp(p.y, 8, h - SIZE - 8) }));
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function onDown(e, isFab) {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false, isFab };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (d.moved) {
      setPos({ x: clamp(d.ox + dx, 8, vp.w - SIZE - 8), y: clamp(d.oy + dy, 8, vp.h - SIZE - 8) });
    }
  }

  function onUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      try { localStorage.setItem(KEY, JSON.stringify(pos)); } catch (_) {}
    } else if (d.isFab) {
      setOpen((o) => !o);
    }
  }

  async function ask(text) {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', text: q }];
    setMsgs(next);
    setInput('');
    const hot = findHotlines(q);
    if (hot) {
      setMsgs([...next, { role: 'bot', hotlines: hot }]);
      return;
    }
    setBusy(true);
    let reply = 'Connection problem. Please try again later.';
    try {
      const data = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: next.slice(1).filter((m) => m.text) }),
      });
      if (data?.reply) reply = data.reply;
    } catch (_) {}
    setMsgs([...next, { role: 'bot', text: reply }]);
    setBusy(false);
  }

  if (!user || pathname.startsWith('/admin')) return null;

  const pw = Math.min(380, vp.w - 16);
  const ph = Math.min(520, vp.h - 100);
  const left = clamp(pos.x + SIZE - pw, 8, vp.w - pw - 8);
  const above = pos.y - ph - 10 >= 8;
  const top = above ? pos.y - ph - 10 : clamp(pos.y + SIZE + 10, 8, vp.h - ph - 8);

  return (
    <>
      {open && (
        <section className="cw" role="dialog" aria-label="GCare Assistant" style={{ left, top, width: pw, height: ph }}>
          <header
            className="cw__head"
            onPointerDown={(e) => onDown(e, false)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <div>
              <h2 className="cw__title">GCare Assistant</h2>
              <p className="cw__sub">Ask about reports, alerts, and volunteering</p>
            </div>
            <button type="button" className="cw__close" onPointerDown={(e) => e.stopPropagation()} onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </header>

          <div className="cw__list">
            {msgs.map((m, i) => (
              <div key={i} className={`cw__msg cw__msg--${m.role}`}>
                {m.hotlines ? <HotlineList data={m.hotlines} /> : m.text}
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="cw__chips">
                {SUGGEST.map((s) => (
                  <button key={s} type="button" className="cw__chip" onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
            {busy && <div className="cw__msg cw__msg--bot cw__dots" role="status" aria-label="GCare Assistant is typing"><span /><span /><span /></div>}
            <div ref={endRef} />
          </div>

          <form className="cw__form" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input className="cw__input" placeholder="Type your question…" value={input} maxLength={500} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" className="cw__send" disabled={busy} aria-label="Send">➤</button>
          </form>
          <p className="cw__note">AI assistant. It can make mistakes. In an emergency, call 911.</p>
        </section>
      )}

      <button
        type="button"
        className="cw__fab"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={(e) => onDown(e, true)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label={open ? 'Close assistant' : 'Open assistant (drag to move)'}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}