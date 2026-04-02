
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

  if (missingPunchOuts.length === 0) return;

  const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
  const globalEndTime = config?.officeEndTime || "18:00";

  let totalProcessed = 0;

  for (const record of missingPunchOuts) {
    const shiftEndTime = record.user.shift?.endTime || globalEndTime;
    const [hours, minutes] = shiftEndTime.split(":").map(Number);

    // Auto punch-out is 2 hours after shift ends
    // record.date is 00:00:00 UTC of that local day.
    // In local time, new Date(record.date) is 05:30:00 (for IST).
    // Setting hours to (endTime + 2) will correctly set the local time.
    const autoPunchOutTime = new Date(record.date);
    autoPunchOutTime.setHours(hours + 2, minutes, 0, 0);

    // Update the attendance record
    await prisma.attendance.update({
      where: { id: record.id },
      data: {
        punchOut: autoPunchOutTime,
        isAutoPunchOut: true
      }
    });

    totalProcessed++;
  }

  // 2. Increment the user's autoPunchOutCount if we processed any
  if (totalProcessed > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        autoPunchOutCount: { increment: totalProcessed }
      }
    });
  }
}
