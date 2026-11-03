import Alerta from '../models/alerts.js';


export const listarAlertas = async (req, res) => {
  try {
    // Buscamos todos los usuarios
    const Alertas = await Alerta.find();
    res.status(200).json(Alertas);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

