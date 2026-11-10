import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AREA, BOUNDARY, pointInPolygon } from '../lib/serviceArea';

/* Pin-the-exact-spot map for the Report page (and a tiny read-only version for My Reports).
   - Asks for the user's location once, when the map opens, and drops the pin there if it is inside the area.
   - The pin can be dragged, or moved by tapping the map. It can never leave the service area. */

const pinSvg = (color) =>
  `<svg viewBox="0 0 32 44" width="32" height="44" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 43 16 43s15-16 15-27.2C31 7.6 24.3 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5.5" fill="#fff"/></svg>`;
const pinIcon = (color = '#a00000') =>
  L.divIcon({ className: 'cmap-pin', html: pinSvg(color), iconSize: [32, 44], iconAnchor: [16, 43] });

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function addAreaLayers(map) {
  const world = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
  L.polygon([world, BOUNDARY], { stroke: false, fillColor: '#1b2437', fillOpacity: 0.42, interactive: false }).addTo(map);
  L.polygon(BOUNDARY, { color: '#a00000', weight: 3, dashArray: '7 6', fill: false, interactive: false }).addTo(map);
}

/* ---------------- Interactive pin map ---------------- */
export default function ReportMap({ pin, onPin }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const asked = useRef(false);
  const api = useRef({});
  const [notice, setNotice] = useState(null);
  const [full, setFull] = useState(false);
  const [locating, setLocating] = useState(false);

  /* Move the pin if it's inside the area; otherwise tell the user. Called by every way of moving it. */
  api.current.move = (lat, lng, { fly = false } = {}) => {
    if (!pointInPolygon([lat, lng])) {
      setNotice({ text: `That spot is outside ${AREA.name}. Pin a location inside the outlined area.`, error: true });
      return false;
    }
    setNotice(null);
    markerRef.current?.setLatLng([lat, lng]);
    if (fly) mapRef.current?.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 18), { duration: 0.6 });
    onPin(lat, lng);
    return true;
  };

  api.current.locate = (auto) => {
    if (!navigator.geolocation) {
      setNotice({ text: 'Your browser can’t share your location. Drag the marker to the exact spot.', error: true });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        if (!api.current.move(coords.latitude, coords.longitude, { fly: true })) {
          setNotice({ text: `You seem to be outside ${AREA.name}. Drag the marker to where the incident is.`, error: true });
        }
      },
      (err) => {
        setLocating(false);
        setNotice({
          text:
            err.code === 1
              ? 'Location access is off. Drag the marker to the exact spot, or allow location in your browser settings.'
              : 'Couldn’t get your location. Drag the marker to the exact spot.',
          error: !auto || err.code !== 1 ? true : false,
        });
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  useEffect(() => {
    const map = L.map(elRef.current, {
      center: [pin.lat, pin.lng],
      zoom: AREA.zoom,
      minZoom: AREA.minZoom,
      maxZoom: AREA.maxZoom,
      maxBounds: L.latLngBounds(BOUNDARY).pad(0.3),
      maxBoundsViscosity: 1,
      zoomControl: false,
    });
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(OSM, { maxZoom: 19, attribution: ATTR }).addTo(map);
    addAreaLayers(map);

    const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon(), draggable: true, keyboard: false }).addTo(map);
    markerRef.current = marker;
    let lastOk = [pin.lat, pin.lng];
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      if (api.current.move(lat, lng)) lastOk = [lat, lng];
      else marker.setLatLng(lastOk); // dropped outside the area: snap back
    });
    map.on('click', (e) => api.current.move(e.latlng.lat, e.latlng.lng));

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);

    // ask for the user's location once, as soon as the map opens
    if (!asked.current) {
      asked.current = true;
      api.current.locate(true);
    }

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [full]);

  return (
    <div className={`rmap ${full ? 'rmap--full' : ''}`.trim()}>
      <div ref={elRef} className="rmap__canvas" role="application" aria-label={`Map of ${AREA.name}. Drag the marker to the exact location.`} />

      <button type="button" className="rmap__tool rmap__full" onClick={() => setFull(!full)} aria-label={full ? 'Exit full screen' : 'Full screen map'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {full ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
        </svg>
      </button>

      <button type="button" className="rmap__tool rmap__locate" onClick={() => api.current.locate(false)} disabled={locating}>
        {locating ? 'Locating…' : 'Use my location'}
      </button>

      {notice && (
        <p role="status" className={`rmap__notice ${notice.error ? 'rmap__notice--error' : ''}`.trim()}>
          {notice.text}
        </p>
      )}
    </div>
  );
}

/* ---------------- Tiny read-only map (My Reports detail) ---------------- */
export function MiniMap({ lat, lng }) {
  const elRef = useRef(null);

  useEffect(() => {
    const map = L.map(elRef.current, {
      center: [lat, lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });
    L.tileLayer(OSM, { maxZoom: 19 }).addTo(map);
    L.marker([lat, lng], { icon: pinIcon(), interactive: false }).addTo(map);
    return () => map.remove();
  }, [lat, lng]);

  return <div ref={elRef} className="minimap" aria-label="Report location" />;
}
