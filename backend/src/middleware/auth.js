import { auth, db } from "../config/firebase.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

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
    next({ status: 401, message: "Invalid or expired Firebase ID token" });
  }
}
