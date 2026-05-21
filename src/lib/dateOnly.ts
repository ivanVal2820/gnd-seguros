export function parseDateOnly(value: string | null | undefined) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDateOnly(date: Date | string | null | undefined) {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month, day, 12, 0, 0, 0));
}

export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}