// Polygon vertices for Masjid al-Haram boundary (approximate)
const HARAM_POLYGON: [number, number][] = [
  [21.4268, 39.8226],
  [21.4268, 39.8298],
  [21.4183, 39.8298],
  [21.4183, 39.8226],
];

function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersects =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function isInsideHaram(lat: number, lng: number): boolean {
  return pointInPolygon(lat, lng, HARAM_POLYGON);
}
