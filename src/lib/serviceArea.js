export const AREA = {
  name: 'Golden Country Homes',
  center: [13.785579, 121.074656], 
  zoom: 17,
  minZoom: 16,
  maxZoom: 19,
};

const SOUTH = 13.783603; 
const NORTH = 13.787165; 
const WEST = 121.069309;
const EAST = 121.07834;

export const BOUNDARY = [
  [NORTH, WEST], 
  [NORTH, EAST],
  [SOUTH, EAST], 
  [SOUTH, WEST], 
];

export function pointInPolygon([lat, lng], poly = BOUNDARY) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

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
  }
}
