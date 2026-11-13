// ===== ARCHIVO: controllers/mapController.js =====
import Usuario from '../models/usuario.js';
import Solicitud from '../models/Solicitud.js';
import EstadoSeguridad from '../models/EstadoSeguridad.js';

export const getMapPoints = async (req, res) => {
  try {
    const usuarios = await Usuario.find({ activo: true }, { nombres: 1, apellidos: 1, rol_id: 1 });
    const solicitudes = await Solicitud.find({ estado_solicitud: { $in: ['Pendiente', 'En camino', 'En proceso', 'En el sitio'] } });
    const estados = await EstadoSeguridad.find();

    const puntos = usuarios.map(u => {
      // Coordenadas base de Popayán. 
      // En producción, aquí leerías u.ubicacion_actual.coordinates
      let latitude = 2.4448 + (Math.sin(u._id) * 0.015);
      let longitude = -76.6147 + (Math.cos(u._id) * 0.015);
      
      let color = 'green'; 
      let type = 'usuario';

      if (u.rol_id === 3) {
        type = 'socorrista'; // Los socorristas se pintan azul en el mapa
      } else {
        const tieneSOS = solicitudes.find(s => s.usuario_id === u._id);
        if (tieneSOS) {
          color = 'red';
        } else {
          const estadoSeg = estados.find(e => e.usuario_id === u._id);
          if (estadoSeg && (estadoSeg.estado === 'En riesgo' || estadoSeg.estado === 'Atrapado')) {
            color = 'orange';
          }
        }
      }

      return { id: u._id, name: `${u.nombres} ${u.apellidos}`, latitude, longitude, color, type };
    });

    res.status(200).json(puntos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error', error: error.message });
  }
};