export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
