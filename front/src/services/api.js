import axios from "axios";
import { auth } from "../lib/firebase.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use(async (config) => {
  if (auth?.authStateReady) {
    await auth.authStateReady();
  }

  const user = auth?.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
