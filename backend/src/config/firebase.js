import admin from "firebase-admin";

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.credential.cert(serviceAccount);
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
