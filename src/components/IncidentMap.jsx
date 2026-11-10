import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AREA, BOUNDARY } from '../lib/serviceArea';

/* Read-only map for the feed: one pin per report, limited to the service area.
   Tap a pin to see details (and highlight its card); picking a card flies the map to its pin.
   Boundary helper: open /feed?trace=1 and click the corners of the area. */

const pinSvg = (color) =>
  `<svg viewBox="0 0 32 44" width="32" height="44" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 43 16 43s15-16 15-27.2C31 7.6 24.3 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5.5" fill="#fff"/></svg>`;
const iconFor = (color) => L.divIcon({ className: 'cmap-pin', html: pinSvg(color || '#a00000'), iconSize: [32, 44], iconAnchor: [16, 43], popupAnchor: [0, -40] });

function popupFor(item) {
  const box = document.createElement('div');
  const add = (tag, text, cls) => {
    const el = document.createElement(tag);
    el.textContent = text;
    if (cls) el.className = cls;
    box.appendChild(el);
  };
  add('span', item.tag, 'imap-pop__tag');
  add('strong', item.title, 'imap-pop__title');
  add('span', `${item.location} · ${item.date}`, 'imap-pop__meta');
  return box;
}

export default function IncidentMap({ items, selectedId, onSelect }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef({});
  const select = useRef(onSelect);
  select.current = onSelect;

  const trace = new URLSearchParams(window.location.search).get('trace') === '1';
  const traceRef = useRef(null);
  const [tracePts, setTracePts] = useState([]);
  const [copied, setCopied] = useState(false);
  const traceOn = useRef(trace);

  useEffect(() => {
    const map = L.map(elRef.current, {
      center: AREA.center,
      zoom: AREA.zoom,
      minZoom: AREA.minZoom,
      maxZoom: AREA.maxZoom,
      maxBounds: L.latLngBounds(BOUNDARY).pad(0.3),
      maxBoundsViscosity: 1,
      zoomControl: false,
    });
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // dim everything outside the service area, then outline it
    const world = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
    L.polygon([world, BOUNDARY], { stroke: false, fillColor: '#1b2437', fillOpacity: 0.42, interactive: false }).addTo(map);
    L.polygon(BOUNDARY, { color: '#a00000', weight: 3, dashArray: '7 6', fill: false, interactive: false }).addTo(map);

    items.forEach((item) => {
      const m = L.marker([item.lat, item.lng], { icon: iconFor(item.tone), title: item.title, riseOnHover: true })
        .bindPopup(popupFor(item), { closeButton: false })
        .on('click', () => select.current?.(item.id))
        .addTo(map);
      markers.current[item.id] = m;
    });

    map.on('click', (e) => {
      if (traceOn.current) setTracePts((p) => [...p, [e.latlng.lat, e.latlng.lng]]);
    });

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markers.current = {};
    };
  }, [items]);

  // a card was picked: fly to its pin and open the details
  useEffect(() => {
    const m = markers.current[selectedId];
    const map = mapRef.current;
    if (!m || !map) return;
    map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 18), { duration: 0.6 });
    m.openPopup();
  }, [selectedId]);

  useEffect(() => {
    if (!trace || !mapRef.current) return;
    traceRef.current?.remove();
    if (tracePts.length) {
      traceRef.current = L.polygon(tracePts, { color: '#067647', weight: 3, fillOpacity: 0.15, interactive: false }).addTo(mapRef.current);
    }
  }, [tracePts, trace]);

  return (
    <div className="cmap imap">
      <div ref={elRef} className="cmap__canvas" role="application" aria-label={`Map of reports in ${AREA.name}`} />

      <div className="cmap__sheet">
        {trace ? (
          <>
            <strong>Boundary tracer</strong>
            <p>Click each corner of the area in order. {tracePts.length} point{tracePts.length === 1 ? '' : 's'} so far.</p>
            <div className="cmap__actions">
              <button type="button" className="cmap__btn" onClick={() => setTracePts((p) => p.slice(0, -1))}>Undo</button>
              <button type="button" className="cmap__btn" onClick={() => setTracePts([])}>Clear</button>
              <button
                type="button"
                className="cmap__btn cmap__btn--primary"
                disabled={tracePts.length < 3}
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(tracePts.map(([a, b]) => [+a.toFixed(6), +b.toFixed(6)])));
                  setCopied(true);
                }}
              >
                {copied ? 'Copied! Paste into BOUNDARY' : 'Copy points'}
              </button>
            </div>
          </>
        ) : (
          <p className="cmap__hint">
            {items.length} report{items.length === 1 ? '' : 's'} in {AREA.name}. Tap a pin or a card for details.
          </p>
        )}
      </div>
    </div>
  );
}
