import Ubicacion from '../models/Ubicacion.js';
import Departamento from '../models/Departamento.js';
import Municipio from '../models/Municipio.js';
import { siguienteId } from '../utils/ids.js';

// ============ TU CÓDIGO ORIGINAL ============
export const crearUbicacion = async (req, res) => {
  try {
    const { usuario_id, latitud, longitud, direccion_aproximada, precision_metros, bateria } = req.body;
    if (!usuario_id || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }
    const lat = Number(latitud);
    const lng = Number(longitud);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) return res.status(400).json({ mensaje: 'Latitud inválida' });
    if (Number.isNaN(lng) || lng < -180 || lng > 180) return res.status(400).json({ mensaje: 'Longitud inválida' });

    const nuevaUbicacion = new Ubicacion({
      _id: await siguienteId(Ubicacion),
      usuario_id, latitud: lat, longitud: lng, direccion_aproximada, precision_metros, bateria, fecha_hora: new Date()
    });
    await nuevaUbicacion.save();
    res.status(201).json({ mensaje: 'Ubicación registrada', ubicacion: nuevaUbicacion });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al registrar', error: error.message });
  }
};

export const consultarHistorial = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const historial = await Ubicacion.find({ usuario_id: usuarioId }).sort({ fecha_hora: -1 });
    if (historial.length === 0) return res.status(404).json({ mensaje: 'No hay ubicaciones para ese usuario' });
    res.status(200).json({ mensaje: 'Historial de ubicaciones', total: historial.length, historial });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar historial', error: error.message });
  }
};

// Listar Departamentos
export const listarDepartamentos = async (req, res) => {
  try {
    const departamentos = await Departamento.find().sort({ nombre: 1 });
    res.status(200).json(departamentos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar departamentos', error: error.message });
  }
};
// Listar Municipios por Departamento
export const listarMunicipiosPorDepartamento = async (req, res) => {
  try {
    const { departamentoId } = req.params;
    // Forzamos a número para que busque bien en la base de datos
    const municipios = await Municipio.find({ departamento_id: Number(departamentoId) }).sort({ nombre: 1 });
    res.status(200).json(municipios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar municipios', error: error.message });
  }
};