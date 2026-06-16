import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase.js";
import api from "./api.js";

export async function registerWithProfile({ name, email, password }) {
  if (!auth) {
    throw new Error("Firebase is not configured. Fill front/.env first.");
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await api.post("/auth/profile", {
    name,
    timezone: "Asia/Manila",
    schedule: {
      start: "09:00",
      end: "18:00",
    },
  });

  return credential.user;
}

export async function login(email, password) {
  if (!auth) {
    throw new Error("Firebase is not configured. Fill front/.env first.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  if (!auth) {
    return;
  }

  await signOut(auth);
}
