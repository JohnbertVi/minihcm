import { Router } from "express";
import {
  myAttendance,
  myDailySummary,
  myWeeklySummary,
  punchInHandler,
  punchOutHandler,
} from "../controllers/attendance.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/punch/in", requireAuth, punchInHandler);
router.post("/punch/out", requireAuth, punchOutHandler);
router.get("/attendance/me", requireAuth, myAttendance);
router.get("/summary/me/daily", requireAuth, myDailySummary);
router.get("/summary/me/weekly", requireAuth, myWeeklySummary);

export default router;
