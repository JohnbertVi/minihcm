import { DateTime, Interval } from "luxon";

const DEFAULT_SCHEDULE = {
  start: "09:00",
  end: "18:00",
};

function parseClock(date, clock, timezone) {
  const [hour, minute] = clock.split(":").map(Number);
  return DateTime.fromISO(date, { zone: timezone }).set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
}

function overlapMinutes(startA, endA, startB, endB) {
  const intervalA = Interval.fromDateTimes(startA, endA);
  const intervalB = Interval.fromDateTimes(startB, endB);
  const overlap = intervalA.intersection(intervalB);
  return overlap ? overlap.length("minutes") : 0;
}

function nightDiffMinutes(punchIn, punchOut, timezone) {
  let cursor = punchIn.startOf("day");
  const finalDay = punchOut.endOf("day");
  let minutes = 0;

  while (cursor <= finalDay) {
    const nightStart = cursor.set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
    const nightEnd = cursor.plus({ days: 1 }).set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    minutes += overlapMinutes(punchIn, punchOut, nightStart.setZone(timezone), nightEnd.setZone(timezone));
    cursor = cursor.plus({ days: 1 });
  }

  return minutes;
}

function roundHours(minutes) {
  return Number((Math.max(0, minutes) / 60).toFixed(2));
}

export function computeDailySummary({ punchIn, punchOut, date, schedule, timezone }) {
  const zone = timezone || "Asia/Manila";
  const shift = { ...DEFAULT_SCHEDULE, ...(schedule || {}) };
  const inTime = DateTime.fromJSDate(punchIn, { zone });
  const outTime = DateTime.fromJSDate(punchOut, { zone });

  if (!inTime.isValid || !outTime.isValid || outTime <= inTime) {
    throw new Error("Punch out must be later than punch in");
  }

  const scheduleStart = parseClock(date, shift.start, zone);
  let scheduleEnd = parseClock(date, shift.end, zone);

  if (scheduleEnd <= scheduleStart) {
    scheduleEnd = scheduleEnd.plus({ days: 1 });
  }

  const workedMinutes = outTime.diff(inTime, "minutes").minutes;
  const regularMinutes = overlapMinutes(inTime, outTime, scheduleStart, scheduleEnd);
  const overtimeMinutes = outTime > scheduleEnd ? outTime.diff(DateTime.max(inTime, scheduleEnd), "minutes").minutes : 0;
  const lateMinutes = inTime > scheduleStart ? inTime.diff(scheduleStart, "minutes").minutes : 0;
  const undertimeMinutes = outTime < scheduleEnd ? scheduleEnd.diff(outTime, "minutes").minutes : 0;
  const ndMinutes = nightDiffMinutes(inTime, outTime, zone);

  return {
    date,
    timezone: zone,
    schedule: shift,
    totalWorkedHours: roundHours(workedMinutes),
    regularHours: roundHours(regularMinutes),
    overtimeHours: roundHours(overtimeMinutes),
    nightDiffHours: roundHours(ndMinutes),
    lateMinutes: Math.round(Math.max(0, lateMinutes)),
    undertimeMinutes: Math.round(Math.max(0, undertimeMinutes)),
  };
}
