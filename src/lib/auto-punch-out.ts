import prisma from "@/lib/prisma";
import { getTodayRange } from "./attendance-helper";

/**
 * Checks for any un-finished attendance records from previous days
 * and automatically punches them out 2 hours after the shift/office end time.
 * Also increments the user's autoPunchOutCount.
 */
export async function processAutoPunchOuts(userId: string) {
  const { start: todayStart } = getTodayRange();

  // 1. Find all records for this user that are older than today and have no punchOut
  const missingPunchOuts = await prisma.attendance.findMany({
    where: {
      userId,
      punchOut: null,
      date: { lt: todayStart }
    },
    include: {
      user: {
        include: { shift: true }
      }
    }
  });

  if (missingPunchOuts.length === 0) return 0;
  return await executeAutoPunchOuts(missingPunchOuts);
}

/**
 * System-wide version of auto punch-out.
 * Processes all users who forgotten to punch out yesterday or before.
 */
export async function processAllAutoPunchOuts() {
  const { start: todayStart } = getTodayRange();

  // 1. Find ALL records system-wide that are older than today and have no punchOut
  const missingPunchOuts = await prisma.attendance.findMany({
    where: {
      punchOut: null,
      date: { lt: todayStart }
    },
    include: {
      user: {
        include: { shift: true }
      }
    }
  });

  if (missingPunchOuts.length === 0) return 0;
  return await executeAutoPunchOuts(missingPunchOuts);
}

/**
 * Shared internal logic for processing a list of forgotten punch-outs.
 */
async function executeAutoPunchOuts(records: any[]) {
  const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } }) as any;
  
  // Policy Toggle: Auto Punch-Out
  if (config && !config.autoPunchOutEnabled) return 0;

  const globalEndTime = config?.officeEndTime || "18:00";
  const delayHours = config?.autoPunchOutDelayHours ?? 2;

  const userIncrements: Record<string, number> = {};
  let totalProcessed = 0;

  for (const record of records) {
    const shiftEndTime = record.user.shift?.endTime || globalEndTime;
    const [hours, minutes] = shiftEndTime.split(":").map(Number);

    const autoPunchOutTime = new Date(record.date);
    autoPunchOutTime.setHours(hours + delayHours, minutes, 0, 0);

    // Update the attendance record
    await prisma.attendance.update({
      where: { id: record.id },
      data: {
        punchOut: autoPunchOutTime,
        isAutoPunchOut: true
      } as any
    });

    userIncrements[record.userId] = (userIncrements[record.userId] || 0) + 1;
    totalProcessed++;
  }

  // Update user counters
  for (const [userId, count] of Object.entries(userIncrements)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        autoPunchOutCount: { increment: count }
      } as any
    });
  }

  return totalProcessed;
}
