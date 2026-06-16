import { DateTime } from "luxon";
import { db, FieldValue, Timestamp } from "../config/firebase.js";
import { computeDailySummary } from "./timeCalculator.js";

const DEFAULT_PROFILE = {
  role: "employee",
  timezone: "Asia/Manila",
  schedule: {
    start: "09:00",
    end: "18:00",
  },
};

export function normalizeProfile(profile = {}) {
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    schedule: {
      ...DEFAULT_PROFILE.schedule,
      ...(profile.schedule || {}),
    },
  };
}

export function todayForProfile(profile) {
  const timezone = profile?.timezone || DEFAULT_PROFILE.timezone;
  return DateTime.now().setZone(timezone).toISODate();
}

export async function createOrUpdateProfile(uid, email, data) {
  const userRef = db.collection("users").doc(uid);
  const existing = await userRef.get();
  const current = existing.exists ? existing.data() : {};
  const profile = normalizeProfile({
    name: data.name || current.name || email,
    email,
    role: current.role || data.role || "employee",
    timezone: data.timezone || current.timezone,
    schedule: data.schedule || current.schedule,
  });

  await userRef.set(
    {
      ...profile,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: current.createdAt || FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return profile;
}

function timestampToMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  return 0;
}

export async function getOpenAttendance(userId, date = null) {
  let query = db
    .collection("attendance")
    .where("userId", "==", userId)
    .where("punchOut", "==", null);

  if (date) {
    query = query.where("date", "==", date);
  }

  const snap = await query.limit(10).get();

  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((record) => record.punchIn && !record.punchOut)
    .sort((a, b) => timestampToMillis(b.punchIn) - timestampToMillis(a.punchIn))[0] || null;
}

export async function punchIn(user) {
  const profile = normalizeProfile(user.profile);
  const date = todayForProfile(profile);
  const openRecord = await getOpenAttendance(user.uid);

  if (openRecord) {
    return { record: openRecord, alreadyOpen: true };
  }

  const recordRef = await db.collection("attendance").add({
    userId: user.uid,
    employeeName: profile.name || user.email,
    email: user.email,
    date,
    punchIn: FieldValue.serverTimestamp(),
    punchOut: null,
    editedByAdmin: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const record = await recordRef.get();
  return { record: { id: record.id, ...record.data() }, alreadyOpen: false };
}

export async function saveDailySummary(record, profile, editedBy = null) {
  if (!record.punchIn || !record.punchOut) {
    return null;
  }

  const normalizedProfile = normalizeProfile(profile);
  const summary = computeDailySummary({
    punchIn: record.punchIn.toDate(),
    punchOut: record.punchOut.toDate(),
    date: record.date,
    schedule: normalizedProfile.schedule,
    timezone: normalizedProfile.timezone,
  });

  const summaryId = `${record.userId}_${record.date}`;
  await db.collection("dailySummary").doc(summaryId).set(
    {
      ...summary,
      userId: record.userId,
      employeeName: record.employeeName || normalizedProfile.name,
      attendanceId: record.id,
      editedBy,
      computedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { id: summaryId, ...summary };
}

export async function punchOut(user) {
  const profile = normalizeProfile(user.profile);
  const openRecord = await getOpenAttendance(user.uid);

  if (!openRecord) {
    const error = new Error("No open punch-in record found");
    error.status = 400;
    throw error;
  }

  const recordRef = db.collection("attendance").doc(openRecord.id);
  await recordRef.update({
    punchOut: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedRecordSnap = await recordRef.get();
  const updatedRecord = { id: updatedRecordSnap.id, ...updatedRecordSnap.data() };
  const summary = await saveDailySummary(updatedRecord, profile);

  return { record: updatedRecord, summary };
}

export function parseIsoToTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date/time value");
  }

  return Timestamp.fromDate(date);
}
