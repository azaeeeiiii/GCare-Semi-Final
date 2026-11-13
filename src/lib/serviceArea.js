/* ===================== serviceArea.js =====================
   The area GCare covers + helpers for the community map.

   BOUNDARY below is a ROUGH PLACEHOLDER drawn around Golden Country Homes, Batangas City.
   To set the real coverage: open /feed?trace=1, click the corners of the subdivision on the map,
   press "Copy points" and paste the result over BOUNDARY (array of [lat, lng]).
   ========================================================== */

export const AREA = {
  name: 'Golden Country Homes',
  center: [13.785079, 121.074656],
  zoom: 17,
  minZoom: 16,
  maxZoom: 19,
};

export const BOUNDARY = [
  [13.787055, 121.071498],
  [13.787055, 121.07834],
  [13.785829, 121.07834],
  [13.783733, 121.077551],
  [13.783103, 121.07606],
  [13.783103, 121.073077],
  [13.785011, 121.070972],
  // entrance strip along the road (south edge, going west to the gate)
  [13.786525, 121.071362],
  [13.786493, 121.070735],
  [13.786437, 121.070241],
  [13.786437, 121.069785],
  [13.786453, 121.069309],
  // around the gate, then back east along the north edge
  [13.786597, 121.069315],
  [13.786581, 121.069788],
  [13.786581, 121.070233],
  [13.786637, 121.070721],
  [13.786669, 121.071399],

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
