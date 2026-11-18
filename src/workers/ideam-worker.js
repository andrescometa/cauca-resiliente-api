import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import Alerta from '../models/alerts.js';
import { enviarPushPorTopic } from '../services/fcmService.js';
import { coordsDeMunicipio } from '../utils/municipiosCauca.js';

const URL_INDICE = 'https://bart.ideam.gov.co/ospa/Alertas/modelos/deslizamientos/ultimo/';

async function siguienteId() {
  const ultima = await Alerta.findOne().sort({ _id: -1 }).lean();
  return (ultima?._id ?? 0) + 1;
}

async function consultarAlertasIdeam() {
  try {
    // 1. Obtener el índice HTML
    const indexResponse = await axios.get(URL_INDICE, {
      timeout: 20000,
      headers: { 'User-Agent': 'CaucaResilienteApp/1.0 (contacto@caucaresiliente.com)' }
    });

    const $ = cheerio.load(indexResponse.data);
    
    // 2. Encontrar el enlace al CSV más reciente (el que tenga "2026" en el nombre)
    let csvUrl = null;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.endsWith('.csv') && href.includes('2026')) {
        csvUrl = URL_INDICE + href;
      }
    });

    if (!csvUrl) {
      console.log('[IDEAM] No se encontró CSV en el índice');
      return;
    }

    console.log(`[IDEAM] Descargando: ${csvUrl}`);

    // 3. Descargar el CSV con encoding latin1 (arregla los caracteres raros)
    const csvResponse = await axios.get(csvUrl, {
      timeout: 30000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'CaucaResilienteApp/1.0 (contacto@caucaresiliente.com)' }
    });

    const texto = Buffer.from(csvResponse.data).toString('latin1');
    const lineas = texto.split(/\r?\n/).filter(l => l.trim());

    console.log(`[IDEAM] CSV con ${lineas.length} líneas`);

    let insertados = 0;
    let pusheados = 0;

    // 4. Procesar cada línea (separador ';')
    for (let i = 1; i < lineas.length; i++) { // i=1 salta la cabecera
      const columnas = lineas[i].split(';');
      if (columnas.length < 10) continue;

      const departamento = (columnas[2] || '').trim();
      const municipio = (columnas[3] || '').trim();
      const nivel = (columnas[5] || '').trim();
      const fechaTexto = (columnas[9] || '').trim();

      // Solo procesar si es del Cauca
      if (!departamento.toUpperCase().includes('CAUCA')) continue;

      // Parsear fecha DD/MM/YYYY
      let fechaEmision = new Date();
      if (fechaTexto) {
        const [dia, mes, anio] = fechaTexto.split('/');
        if (dia && mes && anio) {
          fechaEmision = new Date(Number(anio), Number(mes) - 1, Number(dia));
        }
      }

      // Deduplicar: hash de departamento+municipio+nivel+fecha
      const hash = crypto.createHash('md5')
        .update(`${departamento}|${municipio}|${nivel}|${fechaTexto}`)
        .digest('hex');
      const externalId = `IDEAM-DESL-${hash}`;

      const existe = await Alerta.findOne({ fuente: 'IDEAM', externalId });
      if (existe) continue;

      // Mapear nivel
      let severidad = 'Preventiva';
      const nivelLower = nivel.toLowerCase();
      if (nivelLower.includes('alta') || nivelLower.includes('roja')) severidad = 'Crítica';
      else if (nivelLower.includes('moderada') || nivelLower.includes('naranja')) severidad = 'Urgente';

      const mensaje = `Alerta ${nivel} por deslizamiento en ${municipio}, ${departamento}.`;

      const coords = coordsDeMunicipio(municipio);

      const nuevaAlerta = new Alerta({
        _id: await siguienteId(),
        tipo_alerta: 'Alerta por Deslizamiento',
        mensaje,
        categoria: 'Alerta',
        nivel_severidad: severidad,
        zona_afectada: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : null,
        radio_metros: null,
        fuente: 'IDEAM',
        url_oficial: 'https://www.ideam.gov.co',
        activa: true,
        relevancia: 'dentro',
        externalId,
        rawData: { departamento, municipio, nivel, fechaTexto, columnas },
        fecha_emision: fechaEmision,
        fecha_expiracion: new Date(fechaEmision.getTime() + 24 * 60 * 60 * 1000),
        fecha_actualizacion: new Date()
      });

      try {
        await nuevaAlerta.save();
        insertados++;
      } catch (saveErr) {
        console.error(`[IDEAM] Error guardando ${externalId}:`, saveErr.message);
        continue;
      }

      // Push
      enviarPushPorTopic(
        'alertas_hidro',
        { title: `IDEAM: Deslizamiento ${nivel} - ${municipio}`, body: mensaje },
        { alertId: String(nuevaAlerta._id), category: 'Alerta', severity: severidad, relevancia: 'dentro' }
      ).catch((err) => console.error('[IDEAM] Push falló:', err.message));
      pusheados++;
    }

    console.log(`[IDEAM] Insertados: ${insertados}, con push: ${pusheados}`);
  } catch (error) {
    console.error('[IDEAM] Error en el worker:', error.message);
  }
}

export function iniciarIdeamWorker() {
  cron.schedule('0 */6 * * *', consultarAlertasIdeam, { name: 'ideam-worker', noOverlap: true });
  console.log('[IDEAM] Worker programado cada 6 horas');
}

export { consultarAlertasIdeam };