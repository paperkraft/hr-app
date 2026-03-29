/**
 * Returns the start of the current day (00:00:00) in the user's local timezone
 * but as a Date object that can be used for Prisma queries.
 */
export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Normalizes a date to a YYYY-MM-DD string for safe comparison.
 */
export function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}
