import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import { auth, isFirebaseConfigured, missingFirebaseConfig } from "../lib/firebase.js";
import api from "../services/api.js";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));

  async function loadProfile() {
    const { data } = await api.get("/auth/me");
    setProfile(data.user.profile);
  }

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        await loadProfile();
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      isFirebaseConfigured,
      missingFirebaseConfig,
      isAdmin: profile?.role === "admin",
      refreshProfile: loadProfile,
    }),
    [firebaseUser, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
