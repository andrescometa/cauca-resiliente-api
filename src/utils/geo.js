// src/utils/geo.js

// Centro aproximado del Cauca (Popayán)
export const CAUCA_CENTER = { lat: 2.44, lng: -76.61 };

// Polígono aproximado del Cauca (rectángulo)
export const CAUCA_POLYGON = {
  minLat: 1.0,
  maxLat: 3.5,
  minLng: -78.0,
  maxLng: -75.5
};

// Bounding box de Colombia
export const COLOMBIA_BOUNDS = {
  minLat: -90.0,
  maxLat: 90.0,
  minLng: -180.0,
  maxLng: 180.0
};

// Radio en km para considerar "cerca" por distancia (fronteras: Ecuador, Panamá)
export const CAUCA_RADIUS_KM = 300;

/**
 * Distancia Haversine en km entre dos puntos
 */
export function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Determina la relevancia de un sismo respecto al Cauca.
 * @returns {'dentro' | 'cerca' | 'lejos'}
 *  - dentro: epicentro en el Cauca
 *  - cerca:  epicentro en Colombia (fuera del Cauca) o a <300 km del Cauca
 *  - lejos:  fuera de Colombia y lejos del Cauca
 */
export function clasificarRelevancia(lat, lng) {
  // 1. ¿Está dentro del Cauca?
  const c = CAUCA_POLYGON;
  if (lat >= c.minLat && lat <= c.maxLat && lng >= c.minLng && lng <= c.maxLng) {
    return 'dentro';
  }

  // 2. ¿Está dentro de Colombia?
  const col = COLOMBIA_BOUNDS;
  if (lat >= col.minLat && lat <= col.maxLat && lng >= col.minLng && lng <= col.maxLng) {
    return 'cerca';
  }

  // 3. ¿Está fuera de Colombia pero a <300 km del Cauca? (Ecuador, Panamá)
  const dist = distanciaKm(lat, lng, CAUCA_CENTER.lat, CAUCA_CENTER.lng);
  return dist <= CAUCA_RADIUS_KM ? 'cerca' : 'lejos';
}