/**
 * Returns strict start (00:00:00) and end (23:59:59) for the current day
 * to safely wrap Prisma queries without cross-day leakage.
 */
export function getTodayRange() {
  const now = new Date();
  
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return { start, end };
}

export function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}