// Dates follow the active app language, not the device region.
export function formatDateTime(date: Date, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
