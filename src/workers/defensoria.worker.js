import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Alerta from '../models/alerts.js';
import { enviarPushPorTopic } from '../services/fcmService.js';
import { coordsDeMunicipio } from '../utils/municipiosCauca.js';

const URL_SAT = 'https://alertastempranas.defensoria.gov.co/';
const KEYWORDS_CAUCA = ['cauca', 'popayán', 'popayan', 'balboa', 'mercaderes', 'patía'];

async function siguienteId() {
  const ultima = await Alerta.findOne().sort({ _id: -1 }).lean();
  return (ultima?._id ?? 0) + 1;
}

async function consultarAlertasDefensoria() {
  try {
    const response = await axios.get(URL_SAT, {
      timeout: 20000,
      headers: { 'User-Agent': 'CaucaResilienteApp/1.0 (contacto@caucaresiliente.com)' }
    });

    const $ = cheerio.load(response.data);
    const filas = $('table tbody tr');

    console.log(`[Defensoría] ${filas.length} filas encontradas en el portal`);

    let insertados = 0;
    let pusheados = 0;
    const filasArray = filas.toArray(); // Convertir a array para poder iterar con for...of

    for (const fila of filasArray) {
      try {
        const celdas = $(fila).find('td');
        if (celdas.length < 5) continue;

        const codigoAlerta = $(celdas[0]).text().trim();
        const tipo = $(celdas[1]).text().trim();
        const lugares = $(celdas[2]).text().trim();
        const primerMunicipio = lugares.split(/[(,]/)[0].trim();
        const coords = coordsDeMunicipio(primerMunicipio);
        const temaClave = $(celdas[3]).text().trim();
        const fechaTexto = $(celdas[4]).text().trim();

        if (!codigoAlerta || !temaClave) continue;

        // Parsear fecha DD/MM/YYYY
        let fechaEmision = new Date();
        if (fechaTexto) {
          const [dia, mes, anio] = fechaTexto.split('/');
          if (dia && mes && anio) {
            fechaEmision = new Date(Number(anio), Number(mes) - 1, Number(dia));
          }
        }

        const externalId = `DEF-${codigoAlerta}`;
        const existe = await Alerta.findOne({ fuente: 'Defensoría', externalId });
        if (existe) continue;

        const lugaresLower = lugares.toLowerCase();
        const afectaCauca = KEYWORDS_CAUCA.some((d) => lugaresLower.includes(d));
        const relevancia = afectaCauca ? 'dentro' : 'lejos';

        let severidad = 'Preventiva';
        if (tipo.toLowerCase().includes('inminencia')) severidad = 'Urgente';

        

        const nuevaAlerta = new Alerta({
          _id: await siguienteId(),
          tipo_alerta: `Alerta Temprana ${tipo}`,
          mensaje: temaClave,
          categoria: 'Alerta',
          nivel_severidad: severidad,
          zona_afectada: null,
          radio_metros: null,
          fuente: 'Defensoría',
          url_oficial: URL_SAT,
          activa: true,
          relevancia,
          externalId,
          rawData: { codigoAlerta, tipo, lugares, temaClave, fechaTexto },
          fecha_emision: fechaEmision,
          fecha_expiracion: null,
          fecha_actualizacion: new Date()
        });

        await nuevaAlerta.save();
        insertados++;

        if (afectaCauca) {
          enviarPushPorTopic(
            'alertas_orden_publico',
            {
              title: `Alerta Temprana ${codigoAlerta} - ${lugares.split('(')[0].trim()}`,
              body: temaClave.slice(0, 150) + (temaClave.length > 150 ? '...' : '')
            },
            { alertId: String(nuevaAlerta._id), category: 'Alerta', severity: severidad, relevancia }
          ).catch((err) => console.error('[Defensoría] Push falló:', err.message));
          pusheados++;
        }
      } catch (filaErr) {
        console.error('[Defensoría] Error procesando fila:', filaErr.message);
      }
    }

    console.log(`[Defensoría] Insertados: ${insertados}, con push: ${pusheados}`);
  } catch (error) {
    console.error('[Defensoría] Error en el worker:', error.message);
  }
}

export function iniciarDefensoriaWorker() {
  cron.schedule('*/30 * * * *', consultarAlertasDefensoria, {
    name: 'defensoria-worker',
    noOverlap: true
  });
  console.log('[Defensoría] Worker programado cada 30 minutos');
}

export { consultarAlertasDefensoria };