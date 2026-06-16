export function timestampMillis(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (value._seconds) {
    return value._seconds * 1000;
  }

  const millis = Date.parse(value);
  return Number.isNaN(millis) ? null : millis;
}

export function formatTimestamp(value) {
  const millis = timestampMillis(value);
  if (!millis) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
}

export function formatTime(value) {
  const millis = timestampMillis(value);
  if (!millis) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(millis));
}

export function formatDurationMinutes(minutes) {
  const value = Number(minutes || 0);
  const rounded = Math.max(0, Math.round(value));

  if (rounded < 60) {
    return `${rounded}m`;
  }

  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatElapsedTime(start, end = Date.now()) {
  const startMillis = timestampMillis(start);
  const endMillis = timestampMillis(end);

  if (!startMillis || !endMillis || endMillis <= startMillis) {
    return "0:00:00";
  }

  const totalSeconds = Math.floor((endMillis - startMillis) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function timestampToInput(value) {
  if (!value?._seconds) {
    return "";
  }

  const date = new Date(value._seconds * 1000);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
