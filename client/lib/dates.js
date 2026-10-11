const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2024-03" -> "Mar 2024"; anything unexpected -> ""
export function formatMonth(value) {
  if (typeof value !== "string") return "";
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  return match ? `${MONTHS[Number(match[2]) - 1]} ${match[1]}` : "";
}

// "Mar 2024 – Present" / "Mar 2022 – Dec 2024" / "Mar 2024" / ""
export function dateRange(entry) {
  const start = formatMonth(entry?.startDate);
  const end = formatMonth(entry?.endDate) || (start && entry?.current ? "Present" : "");
  return [start, end].filter(Boolean).join(" – ");
}

// ISO timestamp -> "4 Oct 2026, 22:08" (viewer's local time); invalid -> ""
export function formatDateTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}