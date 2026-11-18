import Counter from '../models/Counter.js';

// Genera el siguiente _id numérico de una colección de forma atómica.
// 1. Sincroniza el contador con el mayor _id numérico existente (por si la
//    colección ya tenía datos o se restauró un backup).
// 2. Incrementa el contador con $inc, que es atómico en MongoDB.
export async function siguienteId(modelo) {
  const coleccion = modelo.collection?.name || modelo.modelName;

  // Solo consideramos _id numéricos: si hubiera ObjectId mezclados, un
  // Number(ObjectId) daría NaN y el contador arrancaría en 1 (colisión).
  const ultimo = await modelo
    .findOne({ _id: { $type: 'number' } }, { _id: 1 })
    .sort({ _id: -1 })
    .lean();
  const maximo = Number(ultimo?._id) || 0;

  await Counter.updateOne(
    { _id: coleccion },
    { $max: { seq: maximo } },
    { upsert: true }
  );

  const contador = await Counter.findOneAndUpdate(
    { _id: coleccion },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  ).lean();

  return contador.seq;
}

export default siguienteId;
