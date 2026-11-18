// Coordenadas aproximadas de los municipios del Cauca (capitales)
export const MUNICIPIOS_CAUCA = {
  'POPAYÁN': { lat: 2.4448, lng: -76.6147 },
  'POPAYAN': { lat: 2.4448, lng: -76.6147 },
  'EL TAMBO': { lat: 2.4522, lng: -76.8119 },
  'GUAPI': { lat: 2.5708, lng: -77.8853 },
  'PATÍA': { lat: 2.1667, lng: -76.9833 },
  'TIMBÍO': { lat: 2.3508, lng: -76.6833 },
  'TIMBIO': { lat: 2.3508, lng: -76.6833 },
  'BALBOA': { lat: 2.0417, lng: -77.2167 },
  'MERCADERES': { lat: 1.7833, lng: -77.1667 },
  'SANTANDER DE QUILICHAO': { lat: 3.0167, lng: -76.4833 },
  'QUILICHAO': { lat: 3.0167, lng: -76.4833 },
  'PUERTO TEJADA': { lat: 3.2333, lng: -76.4167 },
  'CORINTO': { lat: 3.1833, lng: -76.25 },
  'CALOTO': { lat: 3.0333, lng: -76.4 },
  'MIRANDA': { lat: 3.25, lng: -76.25 },
  'PADILLA': { lat: 3.3167, lng: -76.3167 },
  'VILLA RICA': { lat: 2.5167, lng: -76.6333 },
  'PIENDAMÓ': { lat: 2.6333, lng: -76.5333 },
  'PIENDAMO': { lat: 2.6333, lng: -76.5333 },
  'SILVIA': { lat: 2.6167, lng: -76.3833 },
  'CAJIBÍO': { lat: 2.6167, lng: -76.5667 },
  'CAJIBIO': { lat: 2.6167, lng: -76.5667 },
  'MORALES': { lat: 2.75, lng: -76.6333 },
  'SUÁREZ': { lat: 2.95, lng: -76.7 },
  'SUAREZ': { lat: 2.95, lng: -76.7 },
  'BUENOS AIRES': { lat: 3.0167, lng: -76.6333 },
  'CALDONO': { lat: 2.8, lng: -76.4833 },
  'PÁEZ': { lat: 2.65, lng: -76.0 },
  'PAEZ': { lat: 2.65, lng: -76.0 },
  'INZÁ': { lat: 2.55, lng: -76.05 },
  'INZA': { lat: 2.55, lng: -76.05 },
  'TORIBÍO': { lat: 2.95, lng: -76.15 },
  'TORIBIO': { lat: 2.95, lng: -76.15 },
  'JAMBALÓ': { lat: 2.78, lng: -76.32 },
  'JAMBALO': { lat: 2.78, lng: -76.32 },
  'SOTARÁ': { lat: 2.15, lng: -76.55 },
  'SOTARA': { lat: 2.15, lng: -76.55 },
  'ROSAS': { lat: 2.25, lng: -76.75 },
  'LA SIERRA': { lat: 2.25, lng: -76.8 },
  'LA VEGA': { lat: 2.0, lng: -76.9 },
  'ALMAGUER': { lat: 1.55, lng: -76.95 },
  'SAN SEBASTIÁN': { lat: 1.85, lng: -76.75 },
  'SAN SEBASTIAN': { lat: 1.85, lng: -76.75 },
  'SANTA ROSA': { lat: 1.55, lng: -76.6 },
  'FLORENCIA': { lat: 1.68, lng: -77.07 },
  'ARGELIA': { lat: 2.25, lng: -77.25 },
  'BOLÍVAR': { lat: 1.83, lng: -76.97 },
  'BOLIVAR': { lat: 1.83, lng: -76.97 },
  'SUCRE': { lat: 2.03, lng: -76.92 },
  'LA VEGA': { lat: 2.0, lng: -76.9 },
  'PAISPAMBA': { lat: 2.2, lng: -76.75 },
  'TIEMBÍO': { lat: 2.35, lng: -76.68 },
  'TIMBIQUÍ': { lat: 2.35, lng: -76.68 },
  'LÓPEZ DE MICAY': { lat: 2.85, lng: -77.25 },
  'LOPEZ DE MICAY': { lat: 2.85, lng: -77.25 },
  'TACUEYÓ': { lat: 2.65, lng: -76.55 },
  'TACUEYO': { lat: 2.65, lng: -76.55 },
  'PURACÉ': { lat: 2.35, lng: -76.85 },
  'PURACE': { lat: 2.35, lng: -76.85 },
  'PUERTO SANTANDER': { lat: 3.2, lng: -76.5 },
  'FLORENCIA': { lat: 1.68, lng: -77.07 },
};

/**
 * Normaliza el nombre (mayúsculas, sin tildes) y busca las coordenadas.
 * Devuelve null si no encuentra el municipio.
 */
export function coordsDeMunicipio(municipio) {
  if (!municipio) return null;
  const normalizado = municipio.toUpperCase().trim();
  // Intentar directo
  if (MUNICIPIOS_CAUCA[normalizado]) return MUNICIPIOS_CAUCA[normalizado];
  // Intentar quitando tildes
  const sinTildes = normalizado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return MUNICIPIOS_CAUCA[sinTildes] || null;
}