import { auth, db } from "../config/firebase.js";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  let token = null;

  try {
    const header = req.headers.authorization || "";
    token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing Firebase ID token" });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const profileSnap = await db.collection("users").doc(decodedToken.uid).get();

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      profile: profileSnap.exists ? profileSnap.data() : null,
    };

    next();
  } catch (error) {
    const tokenPayload = token ? decodeJwtPayload(token) : null;
    const authError = {
      code: error?.code || "auth/unknown",
      message: error?.message || "Token verification failed",
      expectedProjectId: process.env.FIREBASE_PROJECT_ID || null,
      tokenAudience: tokenPayload?.aud || null,
      tokenIssuer: tokenPayload?.iss || null,
    };

    console.error("Auth verification failed:", JSON.stringify(authError));
    res.status(401).json({
      message: "Invalid or expired Firebase ID token",
      code: authError.code,
      tokenAudience: authError.tokenAudience,
      expectedProjectId: authError.expectedProjectId,
    });
  }
}
