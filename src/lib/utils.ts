import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysDifference(start: Date | string, end: Date | string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Set time to midnight for consistent calculation
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let count = 0;
  let current = new Date(startDate);
  
  while (current <= endDate) {
    if (current.getDay() !== 0) { // 0 is Sunday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
