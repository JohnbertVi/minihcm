import { Router } from "express";
import { getMe, upsertProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.post("/profile", requireAuth, upsertProfile);

export default router;
