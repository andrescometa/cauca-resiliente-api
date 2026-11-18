import admin from 'firebase-admin';

// La inicialización es perezosa: si falta la variable o el JSON es inválido,
// el servidor arranca igual y solo se desactivan las notificaciones push.
// (Antes, Buffer.from(undefined) tumbaba el proceso al importar el módulo).
let messaging = null;
let inicializado = false;

function obtenerMessaging() {
  if (inicializado) return messaging;
  inicializado = true;

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_B64 no definida: notificaciones push deshabilitadas.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(b64, 'base64').toString('utf8')
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    messaging = admin.messaging();
    console.log('✅ Firebase inicializado: notificaciones push habilitadas.');
  } catch (error) {
    console.error('⚠️  No se pudo inicializar Firebase; push deshabilitadas:', error.message);
    messaging = null;
  }

  return messaging;
}

export async function enviarPush(tokens, notification, data = {}) {
  const cliente = obtenerMessaging();
  if (!cliente || !tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  try {
    return await cliente.sendEachForMulticast({ notification, data, tokens });
  } catch (error) {
    console.error('Error enviando push:', error);
    throw error;
  }
}

export async function enviarPushPorTopic(topic, notification, data = {}) {
  const cliente = obtenerMessaging();
  if (!cliente) {
    return { successCount: 0, failureCount: 0 };
  }

  try {
    return await cliente.send({ topic, notification, data });
  } catch (error) {
    console.error('Error enviando push por topic:', error);
    throw error;
  }
}
