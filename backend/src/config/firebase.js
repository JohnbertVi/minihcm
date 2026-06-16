import "./env.js";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return cert(serviceAccount);
  }

  return applicationDefault();
}

if (!getApps().length) {
  initializeApp({
    credential: getCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
}

export const auth = getAuth();
export const db = getFirestore();
export { FieldValue, Timestamp };
