import { Router } from "express";
import {
  adminAttendance,
  adminDailyReports,
  adminUsers,
  adminWeeklyReports,
  updateAdminUser,
  updateAttendance,
} from "../controllers/attendance.controller.js";
import { requireAdmin } from "../middleware/admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", adminUsers);
router.patch("/users/:id", updateAdminUser);
router.get("/attendance", adminAttendance);
router.patch("/attendance/:id", updateAttendance);
router.get("/reports/daily", adminDailyReports);
router.get("/reports/weekly", adminWeeklyReports);

export default router;
