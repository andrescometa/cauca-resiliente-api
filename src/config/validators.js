// Validadores ($jsonSchema) de las colecciones. Se aplican con collMod para
// que el esquema de la base de datos coincida con los modelos Mongoose
// (identificadores numéricos).
export const VALIDADORES = {
  usuarios: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nombres', 'apellidos', 'identificacion', 'email', 'rol_id', 'fecha_registro'],
      properties: {
        nombres: { bsonType: 'string' },
        apellidos: { bsonType: 'string' },
        tipo_documento: { enum: ['CC', 'CE', 'TI', 'PAS'] },
        email: { bsonType: 'string' },
        rol_id: { bsonType: ['int', 'long', 'double', 'number'] },
        ubicacion_actual: {
          bsonType: 'object',
          properties: {
            type: { enum: ['Point'] },
            coordinates: { bsonType: 'array' }
          }
        }
      }
    }
  },
  estados_seguridad: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['usuario_id', 'estado', 'fecha_ultima_actualizacion'],
      properties: {
        usuario_id: { bsonType: ['int', 'long', 'double', 'number'] },
        estado: { enum: ['A salvo', 'En riesgo', 'Atrapado', 'Desaparecido', 'Necesita ayuda', 'Emergencia', 'Sin conexión'] }
      }
    }
  },
  solicitudes_ayuda: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['usuario_id', 'tipo_ayuda', 'nivel_prioridad', 'estado_solicitud', 'fecha_hora'],
      properties: {
        usuario_id: { bsonType: ['int', 'long', 'double', 'number'] },
        tipo_ayuda: { enum: ['Rescate', 'Atención Médica', 'Víveres/Agua', 'Evacuación', 'Incendio', 'Apoyo Logístico', 'Albergue'] },
        nivel_prioridad: { enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
        estado_solicitud: { enum: ['Pendiente', 'En proceso', 'En camino', 'En el sitio', 'Atendido', 'Finalizado', 'Cancelado'] },
        latitud: { bsonType: 'number', minimum: -90, maximum: 90 },
        longitud: { bsonType: 'number', minimum: -180, maximum: 180 }
      }
    }
  }
};
