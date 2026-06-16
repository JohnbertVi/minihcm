export function formatTimestamp(value) {
  if (!value) {
    return "-";
  }

  const millis = value._seconds ? value._seconds * 1000 : Date.parse(value);
  if (Number.isNaN(millis)) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
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
