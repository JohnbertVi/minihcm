import { createOrUpdateProfile } from "../services/attendance.service.js";

export async function upsertProfile(req, res, next) {
  try {
    const profile = await createOrUpdateProfile(req.user.uid, req.user.email, req.body);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json({
    user: {
      uid: req.user.uid,
      email: req.user.email,
      profile: req.user.profile,
    },
  });
}
