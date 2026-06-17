import "./env.js";
import path from "node:path";
import { existsSync, statSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

const backendRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

function buildCertFromSplitEnv() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  });
}

function parseServiceAccountJson(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }

  return cert(JSON.parse(trimmed));
}

function getCredential() {
  const splitEnvCredential = buildCertFromSplitEnv();
  if (splitEnvCredential) {
    return splitEnvCredential;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (error) {
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${error.message}`);
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const credentialPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        ? process.env.GOOGLE_APPLICATION_CREDENTIALS
        : path.resolve(backendRoot, process.env.GOOGLE_APPLICATION_CREDENTIALS);

      if (!existsSync(credentialPath)) {
        throw new Error(`Credential file does not exist: ${credentialPath}`);
      }

      const fileStats = statSync(credentialPath);
      if (fileStats.size === 0) {
        throw new Error(`Credential file is empty: ${credentialPath}`);
      }

      const serviceAccount = JSON.parse(
        readFileSync(credentialPath, "utf8"),
      );
      return cert(serviceAccount);
    } catch (error) {
      throw new Error(`Invalid GOOGLE_APPLICATION_CREDENTIALS path or JSON: ${error.message}`);
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Missing Firebase credentials in Vercel. Set FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, and do not use GOOGLE_APPLICATION_CREDENTIALS there.",
    );
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
