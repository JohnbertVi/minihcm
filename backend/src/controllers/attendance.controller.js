import { DateTime } from "luxon";
import { db, FieldValue } from "../config/firebase.js";
import {
  normalizeProfile,
  parseIsoToTimestamp,
  punchIn,
  punchOut,
  saveDailySummary,
} from "../services/attendance.service.js";

function serializeDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

function readLimit(value, fallback = 100) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function timestampMillis(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  return null;
}

export async function punchInHandler(req, res, next) {
  try {
    const result = await punchIn(req.user);
    res.status(result.alreadyOpen ? 200 : 201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function punchOutHandler(req, res, next) {
  try {
    const result = await punchOut(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function myAttendance(req, res, next) {
  try {
    const limit = readLimit(req.query.limit, 20);
    const snap = await db
      .collection("attendance")
      .where("userId", "==", req.user.uid)
      .limit(limit)
      .get();

    const records = snap.docs.map(serializeDoc).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const summarySnap = await db
      .collection("dailySummary")
      .where("userId", "==", req.user.uid)
      .limit(limit)
      .get();
    const summaries = new Map(summarySnap.docs.map((doc) => [doc.data().date, { id: doc.id, ...doc.data() }]));

    res.json({
      records: records.map((record) => ({
        ...record,
        summary: summaries.get(record.date) || null,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function myDailySummary(req, res, next) {
  try {
    const date = req.query.date || DateTime.now().setZone(req.user.profile?.timezone || "Asia/Manila").toISODate();
    const summaryId = `${req.user.uid}_${date}`;
    const snap = await db.collection("dailySummary").doc(summaryId).get();
    res.json({ summary: snap.exists ? { id: snap.id, ...snap.data() } : null });
  } catch (error) {
    next(error);
  }
}

export async function myWeeklySummary(req, res, next) {
  try {
    const timezone = req.user.profile?.timezone || "Asia/Manila";
    const weekStart = req.query.weekStart || DateTime.now().setZone(timezone).startOf("week").toISODate();
    const weekEnd = DateTime.fromISO(weekStart, { zone: timezone }).plus({ days: 6 }).toISODate();

    const snap = await db.collection("dailySummary").where("userId", "==", req.user.uid).get();
    const summaries = snap.docs
      .map(serializeDoc)
      .filter((item) => item.date >= weekStart && item.date <= weekEnd)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const totals = summaries.reduce(
      (acc, item) => ({
        totalWorkedHours: acc.totalWorkedHours + (item.totalWorkedHours || 0),
        regularHours: acc.regularHours + (item.regularHours || 0),
        overtimeHours: acc.overtimeHours + (item.overtimeHours || 0),
        nightDiffHours: acc.nightDiffHours + (item.nightDiffHours || 0),
        lateMinutes: acc.lateMinutes + (item.lateMinutes || 0),
        undertimeMinutes: acc.undertimeMinutes + (item.undertimeMinutes || 0),
      }),
      { totalWorkedHours: 0, regularHours: 0, overtimeHours: 0, nightDiffHours: 0, lateMinutes: 0, undertimeMinutes: 0 },
    );

    res.json({ weekStart, weekEnd, summaries, totals });
  } catch (error) {
    next(error);
  }
}

export async function adminUsers(req, res, next) {
  try {
    const snap = await db.collection("users").limit(100).get();
    res.json({ users: snap.docs.map(serializeDoc) });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req, res, next) {
  try {
    const userRef = db.collection("users").doc(req.params.id);
    const existingSnap = await userRef.get();

    if (!existingSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = existingSnap.data();
    const role = req.body.role ?? existing.role;

    if (!["admin", "employee"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or employee" });
    }

    const profile = normalizeProfile({
      ...existing,
      name: req.body.name ?? existing.name,
      role,
      timezone: req.body.timezone ?? existing.timezone,
      schedule: {
        ...(existing.schedule || {}),
        ...(req.body.schedule || {}),
      },
    });

    await userRef.set(
      {
        name: profile.name,
        email: existing.email,
        role: profile.role,
        timezone: profile.timezone,
        schedule: profile.schedule,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: req.user.uid,
      },
      { merge: true },
    );

    const updatedSnap = await userRef.get();
    res.json({ user: { id: updatedSnap.id, ...updatedSnap.data() } });
  } catch (error) {
    next(error);
  }
}

export async function adminAttendance(req, res, next) {
  try {
    const limit = readLimit(req.query.limit);
    let query = db.collection("attendance").limit(limit);

    if (req.query.date) {
      query = db.collection("attendance").where("date", "==", req.query.date).limit(limit);
    }

    const snap = await query.get();
    const records = snap.docs.map(serializeDoc).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    res.json({ records });
  } catch (error) {
    next(error);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const recordRef = db.collection("attendance").doc(req.params.id);
    const existingSnap = await recordRef.get();

    if (!existingSnap.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const updates = {
      editedByAdmin: true,
      editedBy: req.user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (Object.prototype.hasOwnProperty.call(req.body, "punchIn")) {
      updates.punchIn = parseIsoToTimestamp(req.body.punchIn);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "punchOut")) {
      updates.punchOut = parseIsoToTimestamp(req.body.punchOut);
    }

    const nextPunchIn = Object.prototype.hasOwnProperty.call(updates, "punchIn")
      ? updates.punchIn
      : existingSnap.data().punchIn;
    const nextPunchOut = Object.prototype.hasOwnProperty.call(updates, "punchOut")
      ? updates.punchOut
      : existingSnap.data().punchOut;
    const punchInMillis = timestampMillis(nextPunchIn);
    const punchOutMillis = timestampMillis(nextPunchOut);

    if (punchInMillis && punchOutMillis && punchOutMillis <= punchInMillis) {
      return res.status(400).json({ message: "Punch out must be later than punch in" });
    }

    await recordRef.update(updates);
    const updatedSnap = await recordRef.get();
    const record = { id: updatedSnap.id, ...updatedSnap.data() };
    const profileSnap = await db.collection("users").doc(record.userId).get();
    const summary = await saveDailySummary(record, profileSnap.data(), req.user.uid);

    res.json({ record, summary });
  } catch (error) {
    next(error);
  }
}

export async function adminDailyReports(req, res, next) {
  try {
    const date = req.query.date || DateTime.now().setZone("Asia/Manila").toISODate();
    const snap = await db.collection("dailySummary").where("date", "==", date).get();
    res.json({ date, reports: snap.docs.map(serializeDoc) });
  } catch (error) {
    next(error);
  }
}

export async function adminWeeklyReports(req, res, next) {
  try {
    const weekStart = req.query.weekStart || DateTime.now().setZone("Asia/Manila").startOf("week").toISODate();
    const weekEnd = DateTime.fromISO(weekStart).plus({ days: 6 }).toISODate();
    const snap = await db.collection("dailySummary").get();

    const grouped = snap.docs
      .map(serializeDoc)
      .filter((report) => report.date >= weekStart && report.date <= weekEnd)
      .reduce((acc, report) => {
        const key = report.userId;
        const current = acc.get(key) || {
          id: key,
          userId: key,
          employeeName: report.employeeName,
          weekStart,
          weekEnd,
          regularHours: 0,
          overtimeHours: 0,
          nightDiffHours: 0,
          lateMinutes: 0,
          undertimeMinutes: 0,
          totalWorkedHours: 0,
        };

        current.regularHours += report.regularHours || 0;
        current.overtimeHours += report.overtimeHours || 0;
        current.nightDiffHours += report.nightDiffHours || 0;
        current.lateMinutes += report.lateMinutes || 0;
        current.undertimeMinutes += report.undertimeMinutes || 0;
        current.totalWorkedHours += report.totalWorkedHours || 0;
        acc.set(key, current);
        return acc;
      }, new Map());

    res.json({ weekStart, weekEnd, reports: Array.from(grouped.values()) });
  } catch (error) {
    next(error);
  }
}
