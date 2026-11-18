import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const messaging = admin.messaging();

export async function enviarPush(tokens, notification, data = {}) {
  if (!tokens || tokens.length === 0) return { successCount: 0, failureCount: 0 };
  try {
    return await messaging.sendEachForMulticast({ notification, data, tokens });
  } catch (error) {
    console.error('Error enviando push:', error);
    throw error;
  }
}

export async function enviarPushPorTopic(topic, notification, data = {}) {
  try {
    return await messaging.send({ topic, notification, data });
  } catch (error) {
    console.error('Error enviando push por topic:', error);
    throw error;
  }
}