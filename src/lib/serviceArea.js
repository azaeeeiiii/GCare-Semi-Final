/* ===================== serviceArea.js =====================
   The area GCare covers + helpers for the community map.

   BOUNDARY below is a ROUGH PLACEHOLDER drawn around Golden Country Homes, Batangas City.
   To set the real coverage: open /feed?trace=1, click the corners of the subdivision on the map,
   press "Copy points" and paste the result over BOUNDARY (array of [lat, lng]).
   ========================================================== */

export const AREA = {
  name: 'Golden Country Homes',
  center: [13.7860778, 121.0747136],
  zoom: 17,
  minZoom: 15,
  maxZoom: 19,
};

export const BOUNDARY = [
  [13.7893, 121.0722],
  [13.7895, 121.0765],
  [13.7872, 121.0782],
  [13.7838, 121.0775],
  [13.7828, 121.0735],
  [13.785, 121.071],
];

/* Ray-casting point-in-polygon. point = [lat, lng], poly = [[lat, lng], ...] */
export function pointInPolygon([lat, lng], poly = BOUNDARY) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* ---------- The pinned report location (the Report page can read this later) ---------- */
const LOCATION_KEY = 'gcare_report_location';

export function saveReportLocation(loc) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ ...loc, savedAt: new Date().toISOString() }));
  } catch {
    /* storage unavailable: ignore */
  }
}

export function getReportLocation() {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY));
  } catch {
    return null;
  }
}

export function clearReportLocation() {
  try {
    localStorage.removeItem(LOCATION_KEY);
  } catch {
    /* ignore */
  }
}
