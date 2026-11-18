import cron from 'node-cron';
import axios from 'axios';
import Alerta from '../models/alerts.js';
import { enviarPushPorTopic } from '../services/fcmService.js';
import { clasificarRelevancia, distanciaKm, CAUCA_CENTER } from '../utils/geo.js';

const URL_FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

// Mapa aproximado de departamentos por coordenadas (para el mensaje de "cerca")
// No es exhaustivo, pero cubre los departamentos con actividad sísmica frecuente
const DEPARTAMENTOS = [
  { nombre: 'Nariño',        minLat: 0.5,  maxLat: 2.0,  minLng: -79.0, maxLng: -77.0 },
  { nombre: 'Valle del Cauca', minLat: 3.0, maxLat: 4.5, minLng: -77.5, maxLng: -75.5 },
  { nombre: 'Chocó',         minLat: 4.0,  maxLat: 8.5,  minLng: -77.9, maxLng: -76.0 },
  { nombre: 'Huila',         minLat: 1.5,  maxLat: 3.5,  minLng: -76.5, maxLng: -74.5 },
  { nombre: 'Tolima',        minLat: 3.0,  maxLat: 5.0,  minLng: -76.0, maxLng: -74.5 },
  { nombre: 'Cundinamarca',  minLat: 3.5,  maxLat: 5.5,  minLng: -75.0, maxLng: -73.0 },
  { nombre: 'Santander',     minLat: 5.5,  maxLat: 8.0,  minLng: -74.5, maxLng: -72.5 },
  { nombre: 'Antioquia',     minLat: 5.5,  maxLat: 8.5,  minLng: -77.0, maxLng: -74.0 },
  { nombre: 'Caldas',        minLat: 4.8,  maxLat: 5.8,  minLng: -76.0, maxLng: -74.5 },
  { nombre: 'Risaralda',     minLat: 4.8,  maxLat: 5.5,  minLng: -76.5, maxLng: -75.5 },
  { nombre: 'Quindío',       minLat: 4.3,  maxLat: 4.8,  minLng: -76.0, maxLng: -75.3 },
  { nombre: 'Cauca',         minLat: 1.0,  maxLat: 3.5,  minLng: -78.0, maxLng: -75.5 }
];

function departamentoAproximado(lat, lng) {
  const depto = DEPARTAMENTOS.find(
    (d) => lat >= d.minLat && lat <= d.maxLat && lng >= d.minLng && lng <= d.maxLng
  );
  return depto?.nombre || 'Colombia';
}

async function siguienteId() {
  const ultima = await Alerta.findOne().sort({ _id: -1 }).lean();
  return (ultima?._id ?? 0) + 1;
}

async function consultarSismosRecientes() {
  try {
    const response = await axios.get(URL_FEED, {
      timeout: 15000,
      headers: {
        'User-Agent': 'CaucaResilienteApp/1.0 (contacto@caucaresiliente.com)'
      }
    });

    const sismos = response.data?.features || [];
    console.log(`[USGS] ${sismos.length} sismos M4.5+ en las últimas 24h`);

    let insertados = 0;
    let pusheados = 0;

    for (const sismo of sismos) {
      const props = sismo.properties;
      const coords = sismo.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const [lng, lat, depth] = coords;
      const externalId = sismo.id;

      // Deduplicar
      const existe = await Alerta.findOne({ fuente: 'USGS', externalId });
      if (existe) continue;

      const relevancia = clasificarRelevancia(lat, lng);
      const distancia = Math.round(
        distanciaKm(lat, lng, CAUCA_CENTER.lat, CAUCA_CENTER.lng)
      );

      // Severidad según magnitud
      let severidad = 'Preventiva';
      if (props.mag >= 6.0) severidad = 'Crítica';
      else if (props.mag >= 5.0) severidad = 'Urgente';

      // Texto según relevancia
      let tipoAlerta, mensaje;
      if (relevancia === 'dentro') {
        tipoAlerta = 'Sismo en el Cauca';
        mensaje = `Sismo de magnitud ${props.mag} en ${props.place || 'el Cauca'}. Profundidad: ${depth?.toFixed(1) || 'N/D'} km. Mantén la calma y sigue los protocolos.`;
      } else if (relevancia === 'cerca') {
        const depto = departamentoAproximado(lat, lng);
        tipoAlerta = `Sismo en ${depto}`;
        mensaje = `Sismo de magnitud ${props.mag} en ${depto}, a ${distancia} km del Cauca. Podrías sentirlo. Profundidad: ${depth?.toFixed(1) || 'N/D'} km.`;
      } else {
        const depto = departamentoAproximado(lat, lng);
        tipoAlerta = 'Sismo regional';
        mensaje = `Sismo de magnitud ${props.mag} en ${props.place || depto}, a ${distancia} km del Cauca. Sin impacto esperado.`;
      }

      const nuevaAlerta = new Alerta({
        _id: await siguienteId(),
        tipo_alerta: tipoAlerta,
        mensaje,
        categoria: 'Alerta',
        nivel_severidad: severidad,
        zona_afectada: { type: 'Point', coordinates: [lng, lat] },
        radio_metros: Math.round(props.mag * 10000),
        fuente: 'USGS',
        url_oficial: props.url || 'https://earthquake.usgs.gov',
        activa: true,
        relevancia,
        externalId,
        rawData: props,
        fecha_emision: new Date(props.time),
        fecha_expiracion: new Date(props.time + 24 * 60 * 60 * 1000),
        fecha_actualizacion: new Date()
      });

      try {
        await nuevaAlerta.save();
        insertados++;
      } catch (saveErr) {
        console.error(`[USGS] Error guardando ${externalId}:`, saveErr.message);
        continue;
      }

      // Push según relevancia
      if (relevancia === 'dentro') {
        // Push a dos topics: sismo y cauca
        for (const topic of ['alertas_sismo', 'alertas_cauca']) {
          enviarPushPorTopic(
            topic,
            { title: tipoAlerta, body: mensaje },
            {
              alertId: String(nuevaAlerta._id),
              category: 'Alerta',
              severity: severidad,
              relevancia
            }
          ).catch((err) => console.error(`[USGS] Push falló (${topic}):`, err.message));
        }
        pusheados++;
      } else if (relevancia === 'cerca') {
        // Push solo a sismo
        enviarPushPorTopic(
          'alertas_sismo',
          { title: tipoAlerta, body: mensaje },
          {
            alertId: String(nuevaAlerta._id),
            category: 'Alerta',
            severity: severidad,
            relevancia
          }
        ).catch((err) => console.error('[USGS] Push falló (alertas_sismo):', err.message));
        pusheados++;
      }
      // Si es 'lejos': no push, solo se guarda en Mongo
    }

    console.log(`[USGS] Insertados: ${insertados}, con push: ${pusheados}`);
  } catch (error) {
    console.error('[USGS] Error en el worker:', error.message);
  }
}

export function iniciarUsgsWorker() {
  cron.schedule('*/5 * * * *', consultarSismosRecientes, {
    name: 'usgs-worker',
    noOverlap: true
  });
  console.log('[USGS] Worker programado cada 5 minutos');
}

// Exportar para pruebas manuales
export { consultarSismosRecientes };